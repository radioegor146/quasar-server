import {ProcessorBackend, ProcessorRequest, ProcessorResponse} from "../backend";
import {sleep} from "../../utils";
import {randomUUID} from "node:crypto";

export class DummyProcessorBackend implements ProcessorBackend {
    async process(request: ProcessorRequest): Promise<ProcessorResponse> {
        await sleep(1000);
        return {
            text: "я хуй знает",
            requireMoreInput: false,
            sessionId: request.sessionId ?? randomUUID(),
            directives: []
        };
    }
}