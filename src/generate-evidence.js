import fs from 'fs';
import { synthesize } from './tts.js';

const testCases = JSON.parse(fs.readFileSync('./evidence/test-strings.json', 'utf-8'));

async function run() {
  for (const { id, naive, controlled } of testCases) {
    console.log(`Generating: ${id}`);
    await synthesize(naive, { outPath: `./evidence/naive/${id}.wav` });
    await synthesize(controlled, { outPath: `./evidence/controlled/${id}.wav` });
  }
  console.log('Done. Listen to /evidence/naive vs /evidence/controlled to compare.');
}

run().catch(console.error);
This regenerates all naive/controlled audio pairs in `evidence/naive/` and `evidence/controlled/`.

## Known Limitations
- Order data is hardcoded (single demo order `4471`) — a production version would connect to a real order database
- No speech-to-text input yet; text input only, spoken output only
- No fallback TTS provider configured — Rime is the sole speech provider in this build
- Not tested under adverse network/telephony conditions

## Third-Party Services
- Rime (text-to-speech, primary and only speech provider)