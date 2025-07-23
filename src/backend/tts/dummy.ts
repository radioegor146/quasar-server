import {
    ProcessorBackend,
    ProcessorRequest,
    ProcessorResponse,
    STTBackend,
    STTBackendSession, STTChunkTranscribeCallback, STTChunkTranscribeResult,
    STTTranscribingParams,
    TTSBackend, TTSRequest, TTSResponse
} from "../backend";
import {sleep} from "../../utils";
import {randomUUID} from "node:crypto";
import fs from "fs";

export class DummyTTSBackend implements TTSBackend {
    async synthesize(request: TTSRequest): Promise<TTSResponse> {
        await sleep(1000);
        return {
            voiceOutput: fs.readFileSync("test.opus"),
            format: "audio/opus"
        };
    }
}