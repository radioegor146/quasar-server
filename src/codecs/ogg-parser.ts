export interface OggPage {
    flags: {
        continuedPacket: boolean;
        firstPage: boolean;
        lastPage: boolean;
    };
    absoluteGranulePosition: bigint;
    streamSerialNumber: number;
    pageSequenceNumber: number;
    pageChecksum: number;
    segments: Buffer[];
}

export class OggParser {
    static parse(chunk: Buffer): OggPage[] {
        const chunks: OggPage[] = [];

        let position = 0;
        const dataView = new DataView(chunk.buffer, chunk.byteOffset, chunk.byteLength);
        while (position < dataView.byteLength) {
            const magic = dataView.getUint32(position, false);
            if (magic != 0x4F676753) {
                throw new Error("Not an Ogg chunk");
            }
            const streamStructureVersion = dataView.getUint8(position + 4);
            if (streamStructureVersion != 0) {
                throw new Error("Wrong Ogg stream structure version");
            }
            const headerTypeFlag = dataView.getUint8(position + 5);
            const absoluteGranulePosition = dataView.getBigUint64(position + 6, true);
            const streamSerialNumber = dataView.getUint32(position + 14, true);
            const pageSequenceNumber = dataView.getUint32(position + 18, true);
            const pageChecksum = dataView.getUint32(position + 22, true);
            const segmentsCount = dataView.getUint8(position + 26);
            const segmentSizes = [];
            for (let i = 0; i < segmentsCount; i++) {
                segmentSizes.push(dataView.getUint8(position + 27 + i));
            }

            position += 27 + segmentsCount;

            const segments = [];
            for (const segmentSize of segmentSizes) {
                segments.push(chunk.subarray(position, position + segmentSize));
                position += segmentSize;
            }

            chunks.push({
                flags: {
                    continuedPacket: (headerTypeFlag & 1) > 0,
                    firstPage: (headerTypeFlag & 2) > 0,
                    lastPage: (headerTypeFlag & 4) > 0,
                },
                absoluteGranulePosition,
                streamSerialNumber,
                pageSequenceNumber,
                pageChecksum,
                segments
            });
        }
        return chunks;
    }
}