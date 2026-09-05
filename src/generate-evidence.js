import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { textToSpeech } from './tts.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const evidenceDir = path.join(__dirname, '..', 'evidence');

const testStrings = JSON.parse(
  fs.readFileSync(path.join(evidenceDir, 'test-strings.json'), 'utf-8')
);
const deliveryStrings = JSON.parse(
  fs.readFileSync(path.join(evidenceDir, 'delivery-strings.json'), 'utf-8')
);

function mkdir(p) { fs.mkdirSync(p, { recursive: true }); }

async function generateSpeedPairs() {
  const normalDir = path.join(evidenceDir, 'normal');
  const slowDir = path.join(evidenceDir, 'slow');
  mkdir(normalDir); mkdir(slowDir);

  for (const item of testStrings) {
    console.log('Speed pair:', item.id);
    const normal = await textToSpeech(item.phrase, { speaker: 'celeste', modelId: 'coda', language: 'en', timeScaleFactor: 1.0 });
    fs.writeFileSync(path.join(normalDir, item.id + '.wav'), normal);
    const slow = await textToSpeech(item.phrase, { speaker: 'celeste', modelId: 'coda', language: 'en', timeScaleFactor: 1.6 });
    fs.writeFileSync(path.join(slowDir, item.id + '.wav'), slow);
  }
}

async function generateDeliveryPairs() {
  const naiveDir = path.join(evidenceDir, 'naive');
  const controlledDir = path.join(evidenceDir, 'controlled');
  mkdir(naiveDir); mkdir(controlledDir);

  for (const item of deliveryStrings) {
    console.log('Delivery pair:', item.id);
    const naive = await textToSpeech(item.naive, { speaker: 'celeste', modelId: 'coda', language: 'en', timeScaleFactor: 1.0 });
    fs.writeFileSync(path.join(naiveDir, item.id + '.wav'), naive);
    const controlled = await textToSpeech(item.controlled, { speaker: 'celeste', modelId: 'coda', language: 'en', timeScaleFactor: 1.0 });
    fs.writeFileSync(path.join(controlledDir, item.id + '.wav'), controlled);
  }
}

async function main() {
  await generateSpeedPairs();
  await generateDeliveryPairs();
  console.log('Done. Clips saved in evidence/normal, evidence/slow, evidence/naive, evidence/controlled');
}

main().catch(console.error);