# Voice Order Tracker — Rime Hackathon Submission

## The Problem
Automated order-tracking systems often speak critical identifiers (order numbers, addresses, confirmation codes) in ways that are hard to understand — numbers and letters run together, causing users to mishear or need repeats. This is a real failure mode in phone-based and voice-first customer service.

## The Product
A voice-first order tracker: the user enters an order number, and the app speaks back the order status, ID, and delivery address — using deliberately formatted text so Rime pronounces identifiers clearly (e.g. spelling out letters/numbers individually instead of reading them as run-together strings).

Voice is not optional here — the only way the user receives their order information is by listening to the spoken response. There is no text fallback in the judged flow.

## Hard Voice Problem: Pronunciation and Controlled Delivery
Naively formatted identifiers (e.g. "AB4471Z") are frequently mispronounced or slurred by TTS systems. We solve this by reformatting identifiers into character-by-character speech-friendly text (e.g. "A, B, 4, 4, 7, 1, Z") before sending to Rime.

**Acceptance test:** For 5 representative tricky strings (order IDs, phone numbers, addresses, drug names, confirmation codes), generate both a naive and a controlled version through Rime, and confirm the controlled version is clearer and more intelligible. See `RIME_EVIDENCE.md` for full results.

## Rime Integration Details
- **Endpoint:** `https://users.rime.ai/v1/rime-tts`
- **Model ID:** `coda`
- **Speaker:** `celeste`
- **Audio format:** WAV
- **Transport:** HTTPS POST, streamed response
- **Auth:** Bearer token via server-side environment variable (never exposed to client)

## Architecture
- `src/tts.js` — Rime API wrapper (text → WAV audio)
- `src/server.js` — Express backend; looks up order data and generates spoken response via Rime
- `public/index.html` — minimal frontend; user enters order number, receives spoken audio response
- `src/generate-evidence.js` — generates naive vs. controlled audio pairs for the acceptance test
- `evidence/` — generated proof clips and test data

## Setup Instructions
1. Clone the repo
2. Run `npm install`
3. Copy `.env.example` to `.env` and add your Rime API key
4. Run `npm start`
5. Open `http://localhost:3000`
6. Enter order number `4471` and click Track

## Reproducing the Evidence

This regenerates all naive/controlled audio pairs in `evidence/naive/` and `evidence/controlled/`.

## Known Limitations
- Order data is hardcoded (single demo order `4471`) — a production version would connect to a real order database
- No speech-to-text input yet; text input only, spoken output only
- No fallback TTS provider configured — Rime is the sole speech provider in this build
- Not tested under adverse network/telephony conditions

## Third-Party Services
- Rime (text-to-speech, primary and only speech provider)