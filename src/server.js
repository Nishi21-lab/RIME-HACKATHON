import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { textToSpeech } from './tts.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

function extractWord(spokenText) {
  let cleaned = spokenText.toLowerCase().trim();
  const prefixes = [
    /^teach me (?:how to say |to say )?/,
    /^how do (?:you|i) say\s*/,
    /^pronounce\s*/,
    /^say\s*/,
    /^what does\s*/
  ];
  for (const p of prefixes) cleaned = cleaned.replace(p, '');
  cleaned = cleaned.replace(/[^a-z\s'-]/g, '').trim();
  return cleaned;
}

app.post('/api/resolve-phrase', (req, res) => {
  const { spokenText } = req.body;
  if (!spokenText) return res.status(400).json({ error: 'spokenText required' });

  const word = extractWord(spokenText);
  if (!word) return res.status(404).json({ error: 'Could not find a word to teach' });
  if (word.length > 60) return res.status(400).json({ error: 'That phrase is too long' });

  const display = word.charAt(0).toUpperCase() + word.slice(1);
  res.json({ phrase: display });
});

app.post('/api/speak-phrase', async (req, res) => {
  const { phrase, speed } = req.body;
  if (!phrase || typeof phrase !== 'string' || phrase.length > 100) {
    return res.status(400).send('Invalid phrase');
  }

  const timeScaleFactor = speed === 'slow' ? 1.6 : 1.0;
  const controller = new AbortController();
  res.on('close', () => {
    if (!res.writableEnded) controller.abort();
  });

  try {
    const audioBuffer = await textToSpeech(phrase, {
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