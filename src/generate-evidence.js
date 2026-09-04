import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { textToSpeech } from './tts.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const testStrings = JSON.parse(
  fs.readFileSync(path.join(__dirname, '..', 'evidence', 'test-strings.json'), 'utf-8')
);

async function main() {
  const normalDir = path.join(__dirname, '..', 'evidence', 'normal');
  const slowDir = path.join(__dirname, '..', 'evidence', 'slow');
  fs.mkdirSync(normalDir, { recursive: true });
  fs.mkdirSync(slowDir, { recursive: true });

  for (const item of testStrings) {
    console.log('Generating:', item.id);

    const normalAudio = await textToSpeech(item.phrase, {
      speaker: 'celeste', modelId: 'coda', language: 'en', timeScaleFactor: 1.0
    });
    fs.writeFileSync(path.join(normalDir, item.id + '.wav'), normalAudio);

    const slowAudio = await textToSpeech(item.phrase, {
      speaker: 'celeste', modelId: 'coda', language: 'en', timeScaleFactor: 1.6
    });
    fs.writeFileSync(path.join(slowDir, item.id + '.wav'), slowAudio);
  }

  console.log('Done. Clips saved in evidence/normal and evidence/slow');
}

main().catch(console.error);