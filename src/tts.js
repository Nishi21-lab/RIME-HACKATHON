import 'dotenv/config';

const RIME_API_KEY = process.env.RIME_API_KEY;
const RIME_ENDPOINT = 'https://users.rime.ai/v1/rime-tts';

export async function textToSpeech(text, options = {}) {
  const {
    speaker = 'celeste',
    modelId = 'coda',
    language = 'en',
    timeScaleFactor = 1.0,
    signal
  } = options;

  const response = await fetch(RIME_ENDPOINT, {
    method: 'POST',
    signal,
    headers: {
      'Authorization': `Bearer ${RIME_API_KEY}`,
      'Content-Type': 'application/json',
      'Accept': 'audio/wav'
    },
    body: JSON.stringify({
      text,
      modelId,
      speaker,
      language,
      timeScaleFactor
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Rime API error: ${response.status} ${errText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}