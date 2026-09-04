import 'dotenv/config';
import fs from 'fs';
import { Readable } from 'stream';
import { pipeline } from 'stream/promises';

const RIME_API_KEY = process.env.RIME_API_KEY;
if (!RIME_API_KEY) {
  throw new Error('Set RIME_API_KEY in your .env file before running.');
}

const DEFAULT_MODEL = 'coda';
const DEFAULT_SPEAKER = 'celeste';

export async function synthesize(text, { model = DEFAULT_MODEL, speaker = DEFAULT_SPEAKER, outPath, phonemizeBetweenBrackets = false } = {}) {
  const headers = {
    'Accept': 'audio/wav',
    'Authorization': `Bearer ${RIME_API_KEY}`,
    'Content-Type': 'application/json'
  };

  const payload = {
    text,
    speaker,
    modelId: model
  };

  if (phonemizeBetweenBrackets) {
    payload.phonemizeBetweenBrackets = true;
  }

  const response = await fetch('https://users.rime.ai/v1/rime-tts', {
    method: 'POST',
    headers,
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Rime API error ${response.status}: ${errText}`);
  }

  if (!response.body) {
    throw new Error('The response did not include an audio body.');
  }

  if (outPath) {
    await pipeline(Readable.fromWeb(response.body), fs.createWriteStream(outPath));
    return outPath;
  }

  // If no outPath, return the buffer instead (used by server.js)
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}