import {STTBackend, STTBackendSession, STTTranscribingParams} from "../backend";
import {WebSocket} from "ws";
import {OpusProcessor} from "../../codecs/opus-processor";

interface GigaAMMessage {
    end_of_utt: boolean;
    text: string;
}

class GigaAMSTTSession extends STTBackendSession {
    private opusProcessor: OpusProcessor;

    constructor(private readonly webSocket: WebSocket) {
        super();
        this.opusProcessor = new OpusProcessor(data => {
            this.webSocket.send(data, {
                binary: true
            });
        }, sampleRate => {
            this.webSocket.send(JSON.stringify({
                sample_rate: sampleRate
            }), {
                binary: false
            });
        })
        webSocket.on("message", (message, isBinary) => {
            const simplifiedMessage = Array.isArray(message) ? Buffer.concat(message) : Buffer.from(message);
            const response = JSON.parse(simplifiedMessage.toString("utf8")) as GigaAMMessage;
            this.chunkTranscribed({
                endOfUtt: response.end_of_utt,
                text: response.text
            });
        });
    }

    transcribeChunk(chunk: Buffer): void {
        this.opusProcessor.handleAudioData(chunk);
    }

    close(): void {
        this.webSocket.close();
    }
}

export class GigaAMSTTBackend implements STTBackend {
    constructor(private readonly endpoint: string) {
    }

    startTranscribing(params: STTTranscribingParams): Promise<STTBackendSession> {
        const webSocket = new WebSocket(this.endpoint);
        return new Promise((resolve, reject) => {
            webSocket.on("error", e => {
                reject(e);
            });
            webSocket.on("close", () => {
                reject(new Error("Unexpected close"));
            });
            webSocket.on("open", () => {
                resolve(new GigaAMSTTSession(webSocket));
            })
        });
    }
}