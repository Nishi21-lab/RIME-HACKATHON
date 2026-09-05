import fs from 'fs';
import { textToSpeech } from './tts.js';

textToSpeech('Hello, this is a test of Rime text to speech.')
  .then(buf => {
    fs.writeFileSync('./test-output.wav', buf);
    console.log('Success! Check test-output.wav');
  })
  .catch(err => console.error('Failed:', err.message));