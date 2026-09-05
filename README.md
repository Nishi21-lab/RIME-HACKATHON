# Voice Pronunciation Tutor — Rime Hackathon Submission

## The Problem
Learning to pronounce a new or tricky word is hard from text alone — spelling doesn't tell you how something actually sounds, and static definitions don't help you practice. People (kids and adults alike) need to *hear* a word spoken clearly, and often need it slowed down to catch every syllable before they can say it back correctly.

## The Product
A hands-free, voice-first pronunciation tutor. The user speaks a request ("teach me refrigerator" or "teach me quokka" — any word, not a fixed list), and the app responds entirely by voice: it speaks the word at normal conversational speed, then automatically repeats it at a slower practice speed so the user can hear each syllable clearly. The user can interrupt at any point — even mid-sentence — to ask about a new word, and the app cleanly cancels the old response and starts fresh.

Voice is not optional here — the only way the user receives a pronunciation model or a practice-speed version is by listening. There is no text fallback of the spoken audio in the judged flow.

## Hard Voice Problems Solved

### 1. Pronunciation and controlled delivery via speed
Some words are hard to parse at natural conversational speed, especially for a new learner. We solve this by rendering the same phrase twice — once at normal speed, once measurably slower — using Rime's `timeScaleFactor` parameter, holding voice and model constant so speed is the only variable.

**Acceptance test:** For 11 representative tricky words/phrases, generate both a normal-speed and a slow-speed (`timeScaleFactor: 1.6`) version through Rime, and confirm the slow version gives clearer syllable-by-syllable separation. See `RIME_EVIDENCE.md` for full results.

### 2. Interruption and recovery
If the user taps the mic while the app is still speaking (e.g. mid normal-speed or mid slow-speed playback), the app must stop immediately, discard the in-flight response, and start listening for the new request — without ever letting the stale audio play afterward. The abort now propagates all the way to the in-flight Rime request itself (via a server-side `AbortController` tied to the client connection), not just to local playback.

**Acceptance test:** Start a phrase playing, interrupt mid-playback by tapping the mic again and asking a different word. Confirm: (1) audio stops within one perceptible instant, (2) the original in-flight Rime request is aborted, (3) the old audio never resumes or plays late, (4) the new request proceeds normally.

## Rime Integration Details
- **Endpoint:** `https://users.rime.ai/v1/rime-tts`
- **Model ID:** `coda`
- **Speaker:** `celeste`
- **Language:** `en`
- **Audio format:** WAV
- **Transport:** HTTPS POST, streamed response
- **Speed control:** `timeScaleFactor` — `1.0` for normal speed, `1.6` for slow practice speed (values above 1.0 slow down speech on Coda)
- **Auth:** Bearer token via server-side environment variable (never exposed to client)

## Architecture
- `src/tts.js` — Rime API wrapper (text + speed option → WAV audio), supports request cancellation via `AbortSignal`
- `src/server.js` — Express backend; extracts the target word from spoken input and generates spoken responses via Rime at both speeds
- `public/index.html` — frontend: voice input (browser Web Speech API), interrupt-and-recover conversational loop, latency display, audio playback
- `src/generate-evidence.js` — generates normal/slow and naive/controlled audio pairs for the acceptance tests
- `evidence/` — generated proof clips and test data (`evidence/normal/`, `evidence/slow/`)

## Voice Input (Speech-to-Text)
Voice input uses the browser's native Web Speech API (`SpeechRecognition`), not a third-party paid service. This is a client-side browser feature and requires **Chrome or Edge** — it is not supported in Firefox or Safari. Rime is not used for speech recognition; Rime's role is exclusively text-to-speech output, which is the primary spoken output judged in this submission.

## Setup Instructions
1. Clone the repo
2. Run `npm install`
3. Copy `.env.example` to `.env` and add your Rime API key
4. Run `npm start`
5. Open `http://localhost:3000` in **Chrome or Edge**
6. Tap "Start", allow microphone access, and say a phrase like "teach me refrigerator" or "teach me quokka" — any word works, not just a fixed list

## Reproducing the Evidence
Run `npm run generate-evidence` to regenerate all four sets of audio (`evidence/normal/`, `evidence/slow/`, `evidence/naive/`, `evidence/controlled/`) from `evidence/test-strings.json` and `evidence/delivery-strings.json`.

## Known Limitations
- Open vocabulary: any word or short phrase can be requested — there's no fixed catalog. Very long input (over ~60 characters after cleanup) is rejected server-side.
- No dictionary or spelling correction — pronunciation quality depends on Rime's handling of whatever text the browser's speech recognizer extracts; unusual, foreign, or unclear words may occasionally need a retry if misheard.
- Voice input (Web Speech API) works reliably only in Chromium-based browsers (Chrome, Edge).
- Interruption relies on tap-to-interrupt (mic button), not continuous open-mic barge-in over active playback — full hands-free barge-in was out of scope given time constraints and mic/speaker echo considerations.
- No fallback TTS provider configured — Rime is the sole speech provider in this build.
- Not tested under adverse network/telephony conditions.

## Third-Party Services
- Rime (text-to-speech, primary and only speech provider)
- Browser-native Web Speech API (speech-to-text, not a paid third-party service; used only for voice input)