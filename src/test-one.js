import { synthesize } from './tts.js';

synthesize('Hello, this is a test of Rime text to speech.', { outPath: './test-output.wav' })
  .then(() => console.log('Success! Check test-output.wav'))
  .catch(err => console.error('Failed:', err.message));