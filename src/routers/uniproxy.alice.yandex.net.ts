import {Application} from "express";
import {getLogger} from "../logger";
import {Server} from "node:http";
import {RawData, Server as WSServer, WebSocket} from "ws";
import {loadProto} from "../proto";
import {randomUUID} from "node:crypto";
import {
    AudioFormat, BiometryAge, BiometryData, BiometryGender,
    ProcessorBackend,
    STTBackend,
    STTBackendSession,
    STTChunkTranscribeResult,
    TTSBackend
} from "../backend/backend";
import {AliceDirective, convertToAliceResponseDirective} from "./alice/directives";

const logger = getLogger();

export interface Backends {
    stt: STTBackend;
    processor: ProcessorBackend;
    tts: TTSBackend;
}

const TClientMessageProto = loadProto(
    "alice/protos/api/alicekit/protocol/client/client_message.proto")
    .lookupType("NAlice.NAliceApi.TClientMessage");
const TServerMessageProto = loadProto(
    "alice/protos/api/alicekit/protocol/server/server_message.proto")
    .lookupType("NAlice.NAliceApi.TServerMessage");

interface VoiceInputStartParams {
    format: AudioFormat;
}

interface ClientProcessingSessionCallbacks {
    onStarted: () => void;
    onTranscribed: (text: string) => void;
    onFullyTranscribed: (text: string, willProcess: boolean) => void;
    onProcessed: (text: string, requireMoreInput: boolean, sessionId: string, directives: AliceDirective[]) => void;
    onSynthesized: (format: AudioFormat, voiceOutput: Buffer) => void;
    onCancelled: () => void;
    onFinished: () => void;
}

class ClientProcessingSession {
    private logger = getLogger<ClientProcessingSession>();

    private sttSession: STTBackendSession | null = null;
    private audioDataBuffer: Buffer[] = [];
    private cancelled: boolean = false;
    private finished: boolean = false;
    private finalTranscribedChunk: STTChunkTranscribeResult | null = null;
    private biometryData: BiometryData | null = null;

    constructor(private readonly backends: Backends,
                private readonly callbacks: ClientProcessingSessionCallbacks,
                private readonly processingBackendSessionId: string | null) {
    }

    startVoiceInput(params: VoiceInputStartParams): void {
        this.backends.stt.startTranscribing({
            format: params.format
        }).then(sttSession => {
            sttSession.setCallback(result => {
                this.onSttTranscribed(result);
            });
            for (const audioData of this.audioDataBuffer) {
                sttSession.transcribeChunk(audioData);
            }
            this.sttSession = sttSession;
            this.audioDataBuffer = [];
        }).catch(e => {
            this.logger.error(`Failed to start transcribing: ${e}`);
        });
        this.callbacks.onStarted();
    }

    cancel(): void {
        if (this.cancelled || this.finished) {
            return;
        }
        this.cancelled = true;
        this.callbacks.onCancelled();
    }

    finish(): void {
        if (this.cancelled || this.finished) {
            return;
        }
        this.finished = true;
        this.callbacks.onFinished();
    }

    handleVoiceInputAudioData(audioData: Buffer): void {
        if (this.cancelled || this.finished) {
            return;
        }
        if (this.sttSession) {
            this.sttSession.transcribeChunk(audioData);
        } else {
            this.audioDataBuffer.push(audioData);
        }
    }

    handleBiometryData(biometryData: BiometryData): void {
        this.biometryData = biometryData;
    }

    handleVoiceInputEnd(): void {
        if (this.cancelled || this.finished) {
            return;
        }
        if (this.sttSession) {
            this.sttSession.close();
            this.sttSession = null;
            this.audioDataBuffer = [];
        }
        const requestText = this.finalTranscribedChunk?.text ?? "";
        const willProcess = requestText.length > 0;
        this.callbacks.onFullyTranscribed(requestText, willProcess);
        if (!willProcess) {
            this.finish();
            return;
        }
        this.backends.processor.process({
            text: requestText,
            sessionId: this.processingBackendSessionId ?? undefined,
            biometry: this.biometryData ?? {
                age: "unknown",
                gender: "unknown"
            }
        })
            .then(result => {
                if (this.cancelled) {
                    return;
                }

                this.callbacks.onProcessed(result.text, result.requireMoreInput,
                    result.sessionId, result.directives);

                this.backends.tts.synthesize({
                    text: result.text
                })
                    .then(result => {
                        if (this.cancelled) {
                            return;
                        }

                        this.callbacks.onSynthesized(result.format, result.voiceOutput);

                        this.finish();
                    })
                    .catch(e => {
                        this.logger.error(`Failed to synthesize: ${e}`);
                    });
            })
            .catch(e => {
                this.logger.error(`Failed to process: ${e}`);
            });
    }

    private onSttTranscribed(result: STTChunkTranscribeResult): void {
        if (this.cancelled || this.finished) {
            return;
        }
        if (result.endOfUtt) {
            this.finalTranscribedChunk = result;
        }
        this.callbacks.onTranscribed(result.text);
        if (result.endOfUtt) {
            this.handleVoiceInputEnd();
        }
    }
}

class UniProxyConnection {
    private readonly logger = getLogger<UniProxyConnection>();

    private currentProcessingSession: ClientProcessingSession | null = null;
    private currentProcessingSessionInputStreamId: number | null = null;

    private activeProcessingSessionId: string | null = null;

    private currentOutputAudioStreamId: number = 1024;

    constructor(private readonly webSocket: WebSocket, private readonly backends: Backends) {
        this.webSocket.on("message", (message, isBinary) => {
            this.handleMessage(message, isBinary).catch(e => {
                this.logger.error(`Failed to handle message: ${e}`);
            });
        });
    }

    private getTimings(): any {
        return {
            SendingTime: {
                seconds: Math.floor(Date.now() / 1000)
            }
        };
    }

    private async handleMessage(message: RawData, isBinary: boolean): Promise<void> {
        const simplifiedMessage = Array.isArray(message) ? Buffer.concat(message) : Buffer.from(message);
        if (isBinary) {
            await this.handleBinaryMessage(simplifiedMessage);
        } else {
            await this.handleTextMessage(simplifiedMessage.toString("utf8"));
        }
    }

    private async handleBinaryMessage(message: Buffer): Promise<void> {
        if (message.length < 4) {
            throw new Error(`Wrong message length? ${message.length}`);
        }
        if (message.subarray(0, 4).equals(new Uint8Array([0x41, 0x41, 0x50, 0x49]))) {
            const rawClientMessage = message.subarray(4);
            const clientMessage = TClientMessageProto.decode(rawClientMessage).toJSON();
            await this.handleClientMessage(clientMessage);
        } else {
            const streamId = new DataView(message.buffer, message.byteOffset, message.length).getUint32(0, false);
            const audioData = message.subarray(4);
            await this.handleAudioMessage(streamId, audioData);
        }
    }

    private async handleTextMessage(message: string): Promise<void> {
        // ignore for now
    }

    private async handleAudioMessage(streamId: number, audioData: Buffer): Promise<void> {
        if (!this.currentProcessingSession) {
            return;
        }
        if (streamId === this.currentProcessingSessionInputStreamId) {
            this.currentProcessingSession.handleVoiceInputAudioData(audioData);
        }
    }

    private async handleClientMessage(clientMessage: any): Promise<void> {
        if (clientMessage.StreamControl) {
            await this.handleStreamControl(clientMessage);
        }
        if (clientMessage.Event) {
            this.logger.debug(`Received event: ${JSON.stringify(Object.keys(clientMessage.Event))}`);
            if (clientMessage.Event.VoiceInput) {
                await this.handleVoiceInputEvent(clientMessage);
            }
            if (clientMessage.Event.LogSpotter) {
                await this.handleLogSpotterEvent(clientMessage);
            }
            if (clientMessage.Event.MatchedUser) {
                await this.handleMatchedUserEvent(clientMessage);
            }
        }
    }

    private async handleMatchedUserEvent(clientMessage: any): Promise<void> {
        const session = this.currentProcessingSession;
        if (!session) {
            return;
        }

        const biometryInfo = clientMessage.Event.MatchedUser.Request.Event.BiometryClassification.Simple;

        const ageClassNames: Record<string, BiometryAge> = {
            "adult": "adult",
            "child": "child"
        };

        const genderClassNames: Record<string, BiometryGender> = {
            "male": "male",
            "female": "female"
        };

        session.handleBiometryData({
            age: ageClassNames[biometryInfo.find((item: any) => item.Tag === "children")?.ClassName] ?? "unknown",
            gender: genderClassNames[biometryInfo.find((item: any) => item.Tag === "gender")?.ClassName] ?? "unknown",
        });
    }

    private async handleVoiceInputEvent(clientMessage: any): Promise<void> {
        if (this.currentProcessingSession) {
            this.currentProcessingSession.cancel();
            this.currentProcessingSession = null;
        }

        this.currentProcessingSessionInputStreamId = parseInt(clientMessage.Event.Header.StreamId);
        this.currentProcessingSession = new ClientProcessingSession(this.backends, {
            onStarted: () => {
                logger.info("Started");

                this.sendServerMessage({
                    Event: {
                        Header: {
                            MessageId: randomUUID(),
                            RefMessageId: clientMessage.Event.Header.MessageId
                        },
                        InputStartAck: {
                            RequestStartTime: Date.now() * 1000
                        }
                    },
                    Timings: this.getTimings()
                });
            },
            onTranscribed: text => {
                logger.info(`Transcribed: '${text}'`);

                this.sendServerMessage({
                    Event: {
                        Header: {
                            MessageId: randomUUID(),
                            RefMessageId: clientMessage.Event.Header.MessageId
                        },
                        AsrResult: {
                            EndOfUtt: false,
                            MessagesCount: 1,
                            ResponseCode: 0,
                            Recognition: [{
                                Words: text.split(" ").map(word => ({
                                    Value: word,
                                    Confidence: 0.999
                                })),
                                Confidence: 0.999,
                                Normalized: text,
                                ParentModel: "speechkit-emu"
                            }]
                        }
                    },
                    Timings: this.getTimings()
                });
            },
            onFullyTranscribed: (text, willProcess) => {
                this.logger.info(`Fully transcribed: '${text}', ${willProcess}`);

                this.currentProcessingSessionInputStreamId = null;
                this.sendServerMessage({
                    Event: {
                        Header: {
                            MessageId: randomUUID(),
                            RefMessageId: clientMessage.Event.Header.MessageId
                        },
                        AsrResult: {
                            EndOfUtt: true,
                            MessagesCount: 0,
                            ResponseCode: 0,
                            Recognition: willProcess ? [{
                                Words: [{
                                    Value: "test",
                                    Confidence: 0.999
                                }],
                                Confidence: 0.999,
                                Normalized: "test",
                                ParentModel: "speechkit-emu"
                            }] : []
                        }
                    },
                    Timings: this.getTimings()
                })
            },
            onProcessed: (text, requireMoreInput, sessionId, directives) => {
                this.logger.info(`Processed: '${text}', ${requireMoreInput}, ${sessionId}`);

                if (requireMoreInput) {
                    this.activeProcessingSessionId = sessionId;
                } else {
                    this.activeProcessingSessionId = null;
                }

                this.sendServerMessage({
                    Event: {
                        Header: {
                            MessageId: randomUUID(),
                            RefMessageId: clientMessage.Event.Header.MessageId
                        },
                        AliceResponse: {
                            Header: {
                                RequestId: clientMessage.Event.VoiceInput.Header.RequestId,
                                SequenceNumber: clientMessage.Event.VoiceInput.Header.SequenceNumber,
                                ResponseId: randomUUID(),
                                DialogId: randomUUID()
                            },
                            VoiceResponse: {
                                OutputSpeech: {
                                    Text: text
                                },
                                ShouldListen: requireMoreInput,
                                HasVoiceResponse: true
                            },
                            Response: {
                                Cards: [],
                                Directives: [
                                    ...directives.map(directive =>
                                        convertToAliceResponseDirective(directive)),
                                    {
                                        Type: "client_action",
                                        Name: "tts_play_placeholder",
                                        AnalyticsType: "tts_play_placeholder",
                                        Payload: {
                                            fields: {
                                                channel: {
                                                    stringValue: "Dialog"
                                                }
                                            }
                                        },
                                        IsLedSilent: true
                                    }
                                ],
                                Suggest: {
                                    Items: []
                                },
                                IsStreaming: false,
                                Alice2EffectiveSettings: {
                                    EffectiveSettings: {
                                        Mode: 2,
                                        Preset: "test-preset",
                                    },
                                    TrialState: {
                                        LeftCount: 9999,
                                        Limit: 9999,
                                        TimeLimitSec: 9999
                                    }
                                },
                                MegamindAnalyticsInfo: {
                                    AnalyticsInfo: [],
                                    WinnerScenario: {
                                        Name: "test-name"
                                    },
                                    IoTUserInfo: {},
                                    ChosenUtterance: "test"
                                },
                                Error: {},
                                ForceServerRequest: false
                            }
                        }
                    },
                    Timings: this.getTimings()
                });
            },
            onSynthesized: (format, voiceOutput) => {
                this.logger.info(`Synthesized: ${format}, ${voiceOutput.length}`);

                this.currentOutputAudioStreamId++;
                this.sendServerMessage({
                    Event: {
                        Header: {
                            MessageId: randomUUID(),
                            RefMessageId: clientMessage.Event.Header.MessageId,
                            StreamId: this.currentOutputAudioStreamId
                        },
                        TtsSpeak: {
                            Format: format,
                            LazyTtsStreaming: false,
                        }
                    },
                    Timings: this.getTimings()
                });
                this.sendAudioDataMessage(this.currentOutputAudioStreamId, voiceOutput);
                this.sendServerMessage({
                    StreamControl: {
                        StreamId: this.currentOutputAudioStreamId,
                        MessageId: randomUUID(),
                        Close: {
                            Reason: 0
                        }
                    },
                    Timings: this.getTimings()
                });
            },
            onCancelled: () => {
                this.logger.info(`Cancelled`);
                this.currentProcessingSession = null;
                this.currentProcessingSessionInputStreamId = null;
                this.activeProcessingSessionId = null;
            },
            onFinished: () => {
                this.logger.info(`Finished`);
                this.currentProcessingSession = null;
            }
        }, this.activeProcessingSessionId);
        this.currentProcessingSession.startVoiceInput({
            format: clientMessage.Event.VoiceInput.Format
        });
    }

    private async handleLogSpotterEvent(clientMessage: any): Promise<void> {
        await this.sendServerMessage({
            Event: {
                Header: {
                    MessageId: randomUUID(),
                    RefMessageId: clientMessage.Event.Header.MessageId
                },
                LogAck: {}
            },
            Timings: this.getTimings()
        })
    }

    private async handleStreamControl(clientMessage: any): Promise<void> {
        if (!this.currentProcessingSession) {
            return;
        }
        const streamId = parseInt(clientMessage.StreamControl.StreamId);
        if (this.currentProcessingSessionInputStreamId != streamId) {
            return;
        }

        const closeReason = clientMessage.StreamControl.Close?.Reason;
        if (!closeReason) {
            return;
        }

        switch (closeReason) {
            case "CANCEL":
                this.currentProcessingSession.cancel();
                break;
            default:
                this.currentProcessingSession.handleVoiceInputEnd();
                break;
        }
    }

    private sendRawData(data: Buffer, isBinary: boolean): Promise<void> {
        return new Promise((resolve, reject) => {
            this.webSocket.send(data, {
                binary: isBinary
            }, error => {
                if (error) {
                    reject(error);
                    return;
                }
                resolve();
            });
        });
    }

    private async sendServerMessage(serverMessage: any): Promise<void> {
        const encoded = TServerMessageProto.encode(serverMessage).finish();
        await this.sendRawData(Buffer.concat([Buffer.from("AAPI", "ascii"), encoded]), true);
    }

    private async sendAudioDataMessage(streamId: number, audioData: Buffer): Promise<void> {
        const streamIdBuffer = new Uint8Array(4);
        const streamIdDataView = new DataView(streamIdBuffer.buffer, streamIdBuffer.byteOffset, streamIdBuffer.length);
        streamIdDataView.setUint32(0, streamId, false);
        const audioDataMessage = Buffer.concat([streamIdBuffer, audioData]);
        await this.sendRawData(audioDataMessage, true);
    }
}

export function registerUniproxyAliceYandexNetRouter(backends: Backends, app: Application, server: Server): void {
    const wsServer = new WSServer({noServer: true});

    server.on("upgrade", (req, socket, head) => {
        if (req.url === "/uniproxy.alice.yandex.net/uni.ws") {
            wsServer.handleUpgrade(req, socket, head, client => {
                wsServer.emit("connection", client, req);
            });
        }
    });

    wsServer.on("connection", (websocket, request) => {
        logger.debug("Got WebSocket connection");

        new UniProxyConnection(websocket, backends);
    });
}