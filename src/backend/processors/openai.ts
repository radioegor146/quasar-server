import {ProcessorBackend, ProcessorRequest, ProcessorResponse} from "../backend";
import {OpenAI} from "openai";
import {randomUUID} from "node:crypto";

export interface OpenAIProcessorBackendParams {
    model: string
}

export class OpenAIProcessorBackend implements ProcessorBackend {
    constructor(private readonly openAI: OpenAI, private readonly params: OpenAIProcessorBackendParams) {
    }

    async process(request: ProcessorRequest): Promise<ProcessorResponse> {
        const completion = await this.openAI.chat.completions.create({
            model: this.params.model,
            messages: [{
                role: "user",
                content: request.text
            }]
        });
        return {
            text: completion.choices[0].message.content ?? "",
            requireMoreInput: false,
            sessionId: randomUUID()
        };
    }
}