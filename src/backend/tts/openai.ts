import {TTSBackend, TTSRequest, TTSResponse} from "../backend";
import {OpenAI} from "openai";

interface OpenAITTSBackendParams {
    model: string;
    voice: string;
    speed: number;
}

export class OpenAITTSBackend implements TTSBackend {
    constructor(private readonly openAI: OpenAI, private readonly params: OpenAITTSBackendParams) {
    }

    async synthesize(request: TTSRequest): Promise<TTSResponse> {
        const result = await this.openAI.audio.speech.create({
            input: request.text,
            voice: this.params.voice,
            response_format: "opus",
            model: this.params.model,
            speed: this.params.speed,
        });
        return {
            voiceOutput: Buffer.from(await result.arrayBuffer()),
            format: "audio/opus",
        }
    }
}