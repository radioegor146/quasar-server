import {STTBackend, STTBackendSession, STTTranscribingParams} from "../backend";
import {sleep} from "../../utils";

class DummySTTSession extends STTBackendSession {

    private hadRecognized: boolean = false;

    transcribeChunk(chunk: Buffer): void {
        console.info(chunk);
        if (!this.hadRecognized && Math.random() < 0.01) {
            this.hadRecognized = true;
            this.chunkTranscribed({
                text: "сколько будет два плюс два",
                endOfUtt: true
            });
        }
    }

    close(): void {
    }
}

export class DummySTTBackend implements STTBackend {
    async startTranscribing(params: STTTranscribingParams): Promise<STTBackendSession> {
        await sleep(200);
        return new DummySTTSession();
    }
}