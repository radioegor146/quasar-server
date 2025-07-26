import {OggPage, OggParser} from "./ogg-parser";
import {OpusParser} from "./opus-stream-parser";
import {OpusEncoder} from "@discordjs/opus";

export class OpusProcessor {
    private encoder: OpusEncoder | null = null;

    constructor(private readonly onAudioData: (data: Buffer) => void,
                private readonly onSampleRate: (sampleRate: number) => void) {
    }

    handleAudioData(audioData: Buffer): void {
        const oggPages = OggParser.parse(audioData);
        for (const page of oggPages) {
            this.handleOpusPage(page);
        }
    }

    private handleOpusPage(page: OggPage): void {
        if (page.pageSequenceNumber == 0) {
            const head = OpusParser.parseOpusHead(Buffer.concat(page.segments));
            if (head.channelCount !== 1) {
                throw new Error(`Unsupported number of channels: ${head.channelCount}`);
            }
            this.encoder = new OpusEncoder(head.sampleRate, head.channelCount);

            this.onSampleRate(head.sampleRate);
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
            this.onAudioData(decoded);
        }
    }
}