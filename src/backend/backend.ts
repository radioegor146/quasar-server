import {AliceDirective} from "../routers/alice/directives";

export type AudioFormat = "audio/opus" | "audio/mp3";

export interface STTChunkTranscribeResult {
    text: string;
    endOfUtt: boolean;
}

export type STTChunkTranscribeCallback = (result: STTChunkTranscribeResult) => void;

export interface STTTranscribingParams {
    format: AudioFormat;
}

export abstract class STTBackendSession {
    private callback: STTChunkTranscribeCallback | null = null;

    setCallback(callback: STTChunkTranscribeCallback): void {
        this.callback = callback;
    }

    protected chunkTranscribed(result: STTChunkTranscribeResult): void {
        if (this.callback) {
            this.callback(result);
        }
    }

    abstract transcribeChunk(chunk: Buffer): void;

    abstract close(): void;
}

export interface STTBackend {
    startTranscribing(params: STTTranscribingParams): Promise<STTBackendSession>;
}

export interface AudioMetadataCapturingParams {
    format: AudioFormat;
}

export abstract class AudioMetadataBackendSession {
    abstract processChunk(chunk: Buffer): void;

    abstract finish(): Promise<object>;
}

export interface AudioMetadataBackend {
    startCapturing(params: AudioMetadataCapturingParams): Promise<AudioMetadataBackendSession>;
}

export interface ProcessorRequest {
    text: string;
    metadata: object;
    sessionId?: string;
}

export interface ProcessorResponse {
    text: string;
    requireMoreInput: boolean;
    sessionId: string;
    directives: AliceDirective[];
}

export interface ProcessorBackend {
    process(request: ProcessorRequest): Promise<ProcessorResponse>;
}

export interface TTSRequest {
    text: string;
}

export interface TTSResponse {
    voiceOutput: Buffer;
    format: AudioFormat;
}

export interface TTSBackend {
    synthesize(request: TTSRequest): Promise<TTSResponse>;
}