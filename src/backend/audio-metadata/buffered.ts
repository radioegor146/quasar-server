import {AudioMetadataBackend, AudioMetadataBackendSession, AudioMetadataCapturingParams} from "../backend";
import {OpusProcessor} from "../../codecs/opus-processor";
import {getLogger} from "../../logger";

class BufferedAudioMetadataBackendSession extends AudioMetadataBackendSession {
    private readonly logger = getLogger();

    private readonly opusProcessor: OpusProcessor;
    private sampleRate: number | null = null;
    private readonly buffers: Buffer[] = [];

    constructor(private readonly backendUrls: string[]) {
        super();
        this.opusProcessor = new OpusProcessor(audioData => {
            this.buffers.push(audioData);
        }, sampleRate => {
            if (this.sampleRate != null && this.sampleRate != sampleRate) {
                throw new Error("Sample rate already defined");
            }
            this.sampleRate = sampleRate;
        });
    }

    processChunk(chunk: Buffer): void {
        this.opusProcessor.handleAudioData(chunk);
    }

    async finish(): Promise<object> {
        if (this.sampleRate == null) {
            return {};
        }
        const totalBuffer = Buffer.concat(this.buffers);
        const promises: Promise<object>[] = [];
        for (const url of this.backendUrls) {
            promises.push((async () => {
                try {
                    const realUrl = new URL(url);
                    realUrl.searchParams.set("sample_rate", this.sampleRate?.toString() ?? "");
                    const result = await fetch(realUrl.toString(), {
                        method: "POST",
                        body: totalBuffer,
                        headers: {
                            "content-type": "application/octet-stream"
                        }
                    });
                    return await result.json();
                } catch (e) {
                    this.logger.warn(`Failed to get audio metadata from ${url}: ${e}`);
                    return {};
                }
            })());
        }

        const results = await Promise.all(promises);
        let totalResult = {};
        for (const result of results) {
            totalResult = {
                ...totalResult,
                ...result
            };
        }
        return totalResult;
    }
}

export class BufferedAudioMetadataBackend implements AudioMetadataBackend {
    constructor(private readonly backendUrls: string[]) {
    }

    async startCapturing(params: AudioMetadataCapturingParams): Promise<AudioMetadataBackendSession> {
        return new BufferedAudioMetadataBackendSession(this.backendUrls);
    }
}