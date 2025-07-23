import {getLogger} from "../../logger";
import {ProcessorBackend, ProcessorRequest, ProcessorResponse} from "../backend";
import {randomUUID} from "node:crypto";

export class BasicProcessorBackend implements ProcessorBackend {
    private readonly logger = getLogger<BasicProcessorBackend>();

    constructor(private readonly url: string) {
    }

    async process(request: ProcessorRequest): Promise<ProcessorResponse> {
        this.logger.info(`Processor request: ${JSON.stringify(request, undefined, 4)}`);
        const response = await (await fetch(this.url, {
            method: "POST",
            body: JSON.stringify(request),
            headers: {
                "content-type": "application/json"
            }
        })).json();
        this.logger.info(`Processor response: ${JSON.stringify(response, undefined, 4)}`);
        if (!response.success) {
            return {
                text: "Failed to process your request",
                requireMoreInput: false,
                sessionId: randomUUID(),
                directives: []
            };
        }
        return response;
    }
}