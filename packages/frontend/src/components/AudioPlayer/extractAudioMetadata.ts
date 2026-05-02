export type ExtractedAudioMetadata = {
  title?: string;
  artist?: string;
  coverUrl?: string;
};

function cleanText(value?: string): string | undefined {
  const cleaned = value?.replace(/\0/g, '').replace(/\s+/g, ' ').trim();
  return cleaned || undefined;
}

function readSyncSafeInt(bytes: Uint8Array, offset: number): number {
  return (
    ((bytes[offset] & 0x7f) << 21) |
    ((bytes[offset + 1] & 0x7f) << 14) |
    ((bytes[offset + 2] & 0x7f) << 7) |
    (bytes[offset + 3] & 0x7f)
  );
}

function readUInt32(bytes: Uint8Array, offset: number): number {
  return (
    (bytes[offset] << 24) |
    (bytes[offset + 1] << 16) |
    (bytes[offset + 2] << 8) |
    bytes[offset + 3]
  ) >>> 0;
}

function decodeLatin1(bytes: Uint8Array): string {
  let result = '';

  for (let i = 0; i < bytes.length; i += 1) {
    result += String.fromCharCode(bytes[i]);
  }

  return result;
}

function decodeText(bytes: Uint8Array, encoding: number): string {
  if (!bytes.length) return '';

  try {
    if (encoding === 0) {
      return decodeLatin1(bytes);
    }

    if (encoding === 1) {
      if (bytes.length >= 2) {
        const b0 = bytes[0];
        const b1 = bytes[1];

        if (b0 === 0xff && b1 === 0xfe) {
          return new TextDecoder('utf-16le').decode(bytes.slice(2));
        }

        if (b0 === 0xfe && b1 === 0xff) {
          return new TextDecoder('utf-16be').decode(bytes.slice(2));
        }
      }

      return new TextDecoder('utf-16le').decode(bytes);
    }

    if (encoding === 2) {
      return new TextDecoder('utf-16be').decode(bytes);
    }

    if (encoding === 3) {
      return new TextDecoder('utf-8').decode(bytes);
    }

    return new TextDecoder('utf-8').decode(bytes);
  } catch {
    return '';
  }
}

function decodeTextFrame(frameData: Uint8Array): string | undefined {
  if (frameData.length < 2) return undefined;

  const encoding = frameData[0];
  const textBytes = frameData.slice(1);

  return cleanText(decodeText(textBytes, encoding));
}

function findZeroByte(bytes: Uint8Array, start: number): number {
  for (let i = start; i < bytes.length; i += 1) {
    if (bytes[i] === 0) return i;
  }

  return -1;
}

function findTextTerminator(bytes: Uint8Array, start: number, encoding: number): number {
  if (encoding === 0 || encoding === 3) {
    return findZeroByte(bytes, start);
  }

  for (let i = start; i + 1 < bytes.length; i += 2) {
    if (bytes[i] === 0 && bytes[i + 1] === 0) return i;
  }

  return -1;
}

function getTerminatorLength(encoding: number): number {
  return encoding === 0 || encoding === 3 ? 1 : 2;
}

function parseApicFrame(frameData: Uint8Array): string | undefined {
  if (frameData.length < 5) return undefined;

  const encoding = frameData[0];

  const mimeEnd = findZeroByte(frameData, 1);
  if (mimeEnd === -1) return undefined;

  const mimeType = decodeLatin1(frameData.slice(1, mimeEnd)).trim() || 'image/jpeg';

  let offset = mimeEnd + 1;

  // picture type
  offset += 1;

  const descriptionEnd = findTextTerminator(frameData, offset, encoding);
  if (descriptionEnd === -1) return undefined;

  offset = descriptionEnd + getTerminatorLength(encoding);

  if (offset >= frameData.length) return undefined;

  const imageBytes = frameData.slice(offset);
  const blob = new Blob([imageBytes], { type: mimeType });

  return URL.createObjectURL(blob);
}

function isValidFrameId(frameId: string): boolean {
  return /^[A-Z0-9]{4}$/.test(frameId);
}

export async function extractAudioMetadata(src: string): Promise<ExtractedAudioMetadata> {
  const response = await fetch(src);

  if (!response.ok) {
    return {};
  }

  const arrayBuffer = await response.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);

  if (bytes.length < 10) {
    return {};
  }

  const hasId3 =
    bytes[0] === 0x49 &&
    bytes[1] === 0x44 &&
    bytes[2] === 0x33;

  if (!hasId3) {
    return {};
  }

  const majorVersion = bytes[3];

  if (majorVersion < 2 || majorVersion > 4) {
    return {};
  }

  const tagSize = readSyncSafeInt(bytes, 6);
  const tagEnd = Math.min(10 + tagSize, bytes.length);

  let offset = 10;

  const result: ExtractedAudioMetadata = {};

  while (offset < tagEnd) {
    let frameId = '';
    let frameSize = 0;
    let frameDataOffset = 0;

    if (majorVersion === 2) {
      if (offset + 6 > tagEnd) break;

      frameId = String.fromCharCode(
        bytes[offset],
        bytes[offset + 1],
        bytes[offset + 2]
      );

      frameSize =
        (bytes[offset + 3] << 16) |
        (bytes[offset + 4] << 8) |
        bytes[offset + 5];

      frameDataOffset = offset + 6;

      if (!/^[A-Z0-9]{3}$/.test(frameId)) break;
    } else {
      if (offset + 10 > tagEnd) break;

      frameId = String.fromCharCode(
        bytes[offset],
        bytes[offset + 1],
        bytes[offset + 2],
        bytes[offset + 3]
      );

      frameSize =
        majorVersion === 4
          ? readSyncSafeInt(bytes, offset + 4)
          : readUInt32(bytes, offset + 4);

      frameDataOffset = offset + 10;

      if (!isValidFrameId(frameId)) break;
    }

    if (frameSize <= 0) break;

    const frameDataEnd = frameDataOffset + frameSize;

    if (frameDataEnd > tagEnd || frameDataEnd > bytes.length) break;

    const frameData = bytes.slice(frameDataOffset, frameDataEnd);

    if (frameId === 'TIT2' || frameId === 'TT2') {
      result.title = decodeTextFrame(frameData) || result.title;
    }

    if (frameId === 'TPE1' || frameId === 'TP1') {
      result.artist = decodeTextFrame(frameData) || result.artist;
    }

    if (frameId === 'APIC' || frameId === 'PIC') {
      if (!result.coverUrl) {
        result.coverUrl = parseApicFrame(frameData);
      }
    }

    if (result.title && result.artist && result.coverUrl) {
      break;
    }

    offset = frameDataEnd;
  }

  return {
    title: cleanText(result.title),
    artist: cleanText(result.artist),
    coverUrl: result.coverUrl,
  };
}
