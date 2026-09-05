import 'dotenv/config';

const res = await fetch('https://users.rime.ai/v1/rime-tts', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${process.env.RIME_API_KEY}`,
    'Content-Type': 'application/json',
    'Accept': 'audio/wav'
  },
  body: JSON.stringify({
    text: 'Hello world',
    modelId: 'coda',
    speaker: 'celeste',
    language: 'en'
  })
});

console.log('Status:', res.status);
const buf = Buffer.from(await res.arrayBuffer());
console.log('Bytes received:', buf.length);
