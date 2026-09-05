import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { textToSpeech } from './tts.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

const PHRASES = {
  butterfly: { english: 'Butterfly', phrase: 'Butterfly', keywords: ['butterfly'] },
  spaghetti: { english: 'Spaghetti', phrase: 'Spaghetti', keywords: ['spaghetti'] },
  refrigerator: { english: 'Refrigerator', phrase: 'Refrigerator', keywords: ['refrigerator', 'fridge'] },
  unicorn: { english: 'Unicorn', phrase: 'Unicorn', keywords: ['unicorn'] },
  chocolate: { english: 'Chocolate', phrase: 'Chocolate', keywords: ['chocolate'] },
  peculiar: { english: 'Peculiar', phrase: 'Peculiar', keywords: ['peculiar'] }
};

function resolvePhrase(spokenText) {
  const lower = spokenText.toLowerCase();
  let bestKey = null;
  let bestScore = 0;
  for (const [key, data] of Object.entries(PHRASES)) {
    let score = 0;
    for (const kw of data.keywords) if (lower.includes(kw)) score += 1;
    if (score > bestScore) { bestScore = score; bestKey = key; }
  }
  return bestScore > 0 ? bestKey : null;
}

app.post('/api/resolve-phrase', (req, res) => {
  const { spokenText } = req.body;
  if (!spokenText) return res.status(400).json({ error: 'spokenText required' });
  const phraseKey = resolvePhrase(spokenText);
  if (!phraseKey) return res.status(404).json({ error: 'No matching phrase found' });
  const data = PHRASES[phraseKey];
  res.json({ phraseKey, english: data.english });
});

app.post('/api/speak-phrase', async (req, res) => {
  const { phraseKey, speed } = req.body;
  const data = PHRASES[phraseKey];
  if (!data) return res.status(404).send('Phrase not found');

  const timeScaleFactor = speed === 'slow' ? 1.6 : 1.0;
  const controller = new AbortController();

  res.on('close', () => {
    if (!res.writableEnded) {
      controller.abort();
    }
  });

  try {
    const audioBuffer = await textToSpeech(data.phrase, {
      speaker: 'celeste',
      modelId: 'coda',
      language: 'en',
      timeScaleFactor,
      signal: controller.signal
    });
    res.set('Content-Type', 'audio/wav');
    res.send(audioBuffer);
  } catch (err) {
    if (err.name === 'AbortError') return;
    console.error(err);
    res.status(500).send('TTS generation failed');
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));