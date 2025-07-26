import {AudioMetadataBackend, AudioMetadataBackendSession, AudioMetadataCapturingParams} from "../backend";

class DummyAudioMetadataBackendSession extends AudioMetadataBackendSession {
    processChunk(chunk: Buffer): void {
    }

    async finish(): Promise<object> {
        return {};
    }
}

export class DummyAudioMetadataBackend implements AudioMetadataBackend {
    async startCapturing(params: AudioMetadataCapturingParams): Promise<AudioMetadataBackendSession> {
        return new DummyAudioMetadataBackendSession();
    }
}