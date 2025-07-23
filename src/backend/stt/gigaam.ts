import {STTBackend, STTBackendSession, STTTranscribingParams} from "../backend";
import {OggPage, OggParser} from "../../codecs/ogg-parser";
import {OpusParser} from "../../codecs/opus-stream-parser";
import {OpusEncoder} from "@discordjs/opus";
import {WebSocket} from "ws";
import fs from "fs";
import {WriteStream} from "node:fs";

interface GigaAMMessage {
    end_of_utt: boolean;
    text: string;
}

class GigaAMSTTSession extends STTBackendSession {
    private encoder: OpusEncoder | null = null;
    // private outputStream: WriteStream;

    constructor(private readonly webSocket: WebSocket) {
        super();
        webSocket.on("message", (message, isBinary) => {
            const simplifiedMessage = Array.isArray(message) ? Buffer.concat(message) : Buffer.from(message);
            const response = JSON.parse(simplifiedMessage.toString("utf8")) as GigaAMMessage;
            this.chunkTranscribed({
                endOfUtt: response.end_of_utt,
                text: response.text
            });
        });
        // this.outputStream = fs.createWriteStream(`recordings/${Math.random()}.bin`);
    }

    transcribeChunk(chunk: Buffer): void {
        const oggPages = OggParser.parse(chunk);
        for (const page of oggPages) {
            this.transcribeOpusChunk(page);
        }
    }

    close(): void {
        this.webSocket.close();
        // this.outputStream.close();
    }

    private transcribeOpusChunk(page: OggPage) {
        if (page.pageSequenceNumber == 0) {
            const head = OpusParser.parseOpusHead(Buffer.concat(page.segments));
            if (head.channelCount !== 1) {
                throw new Error(`Unsupported number of channels: ${head.channelCount}`);
            }
            this.encoder = new OpusEncoder(head.sampleRate, head.channelCount);

            this.webSocket.send(JSON.stringify({
                sample_rate: head.sampleRate
            }), {
                binary: false
            });

            return;
        }
        if (page.pageSequenceNumber == 1) {
            // skip page
            return;
        }
        if (this.encoder === null) {
            throw new Error("Can't decode Opus without OpusHead before");
        }
        for (const segment of page.segments) {
            const decoded = this.encoder.decode(segment);
            // this.outputStream.write(decoded);
            this.webSocket.send(decoded, {
                binary: true
            });
        }
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