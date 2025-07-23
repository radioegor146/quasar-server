import {OggPage} from "./ogg-parser";

interface OpusHead {
    channelCount: number;
    preSkip: number;
    sampleRate: number;
    outputGain: number;
}

export class OpusParser {

    private static readonly OPUS_HEAD_BUFFER = Buffer.from([0x4F, 0x70, 0x75, 0x73, 0x48, 0x65, 0x61, 0x64]);

    static parseOpusHead(buffer: Buffer): OpusHead {
        const dataView = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength);
        if (!buffer.subarray(0, 8).equals(OpusParser.OPUS_HEAD_BUFFER)) {
            throw new Error("OpusHead is not present in zero page");
        }
        if (dataView.getUint8(8) != 1) {
            throw new Error("Wrong Opus version");
        }
        const channelCount = dataView.getUint8(9);
        const preSkip = dataView.getUint16(10, true);
        const sampleRate = dataView.getUint32(12, true);
        const outputGain = dataView.getUint16(14, true);
        const mappingFamily = dataView.getUint8(16);
        if (mappingFamily != 0) {
            throw new Error("Unsupported mapping family");
        }
        return {
            channelCount,
            preSkip,
            sampleRate,
            outputGain
        };
    }
}