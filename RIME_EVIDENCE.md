# Rime Evidence: Pronunciation Clarity via Speed and Controlled Delivery

## Hard Voice Claim

Two related pronunciation problems are solved with Rime as the sole speech output:

1. **Speed control for syllable clarity** — the same word, rendered by Rime at a
   slower speed (`timeScaleFactor: 1.6`), gives noticeably clearer syllable-by-syllable
   separation than the identical word at normal speed (`timeScaleFactor: 1.0`) —
   making it more useful as a pronunciation model for a learner.
2. **Controlled delivery for hard domain vocabulary** — for terms that are easy to
   mispronounce or misparse when spoken naively (drug names, confirmation codes,
   order IDs, phone numbers, addresses), rendering the text as-is ("naive") produces
   worse intelligibility than rendering it with explicit formatting/phonetic hints
   ("controlled") — while holding voice and model constant.

## Acceptance Test

### 1. Speed comparison (`evidence/normal/` vs `evidence/slow/`)

For 11 representative words of varying syllable count and difficulty, generate two
Rime TTS outputs per item:

- **Normal** — `timeScaleFactor: 1.0`
- **Slow** — `timeScaleFactor: 1.6`

Voice, model, and language held constant across both versions (`celeste` / `coda` / `en`)
to isolate the effect of speed alone.

Words tested: `anesthesiologist`, `butterfly`, `chocolate`, `otorhino`, `peculiar`,
`refrigerator`, `sixth_sheikh`, `spaghetti`, `specificity`, `unicorn`, `worcestershire`.

### 2. Controlled vs. naive delivery (`evidence/controlled/` vs `evidence/naive/`)

For 5 domain-vocabulary categories that are common failure points for TTS in real
workflows, generate two Rime TTS outputs per item, voice/model held constant:

- **Naive** — the raw text passed to Rime with no formatting or phonetic guidance.
- **Controlled** — the same text passed with explicit formatting/phonetic hints
  (e.g. spaced-out digits, hyphenation, spelled-out phonetics, punctuation cues)
  to steer Rime's pronunciation.

Categories tested: `address`, `confirmation_code`, `drug_name`, `order_id`, `phone`.

## Procedure

1. Test phrases and formatting variants defined in `evidence/test-strings.json`.
2. Run `node src/generate-evidence.js` to regenerate all four sets of audio
   (`evidence/normal/`, `evidence/slow/`, `evidence/naive/`, `evidence/controlled/`)
   from source.
3. Each pair in a set differs only in the one variable under test (speed, or
   naive-vs-controlled formatting) — everything else (voice, model, language) is
   held constant.
4. Listen to each pair back-to-back.

## Result

- **Speed:** across all 11 words, the slow-speed versions produced audibly more
  distinct syllable boundaries than the normal-speed versions, most noticeably on
  higher-syllable-count and less-common words (`refrigerator`, `otorhino`,
  `worcestershire`, `sixth_sheikh`) where syllables blend together more at normal speed.
- **Controlled delivery:** across all 5 domain-vocabulary categories, the controlled
  versions were more clearly intelligible and closer to the intended reading than the
  naive versions, which were more prone to mumbled digit runs (`confirmation_code`,
  `order_id`, `phone`) and misread or garbled terms (`drug_name`, `address`).

Audio clips for all four sets are committed under `evidence/normal/`, `evidence/slow/`,
`evidence/naive/`, and `evidence/controlled/` for direct comparison.

## Interruption and Recovery — Supplementary Evidence

In addition to the two claims above, the product also handles mid-playback interruption:

- Tapping the mic while audio is playing immediately pauses playback and aborts the
  in-flight fetch to Rime via `AbortController`.
- A per-turn request ID ("fencing" token) ensures that if a new request has started,
  any late-arriving audio from the previous (interrupted) request is discarded rather
  than played — verified by manually interrupting mid-sentence and confirming the old
  audio never resumes or plays after the interruption.

## Limitations

- Evaluation of both speed-clarity and controlled-vs-naive delivery was
  subjective/listening-based rather than using an automated intelligibility metric
  (e.g. word error rate via re-transcription).
- Small sample sizes (11 words, 5 domain-vocabulary categories) — findings should be
  treated as illustrative rather than statistically rigorous.
- `timeScaleFactor` of 1.6 was chosen empirically as a "clearly slower but still
  natural-sounding" value; other values were not systematically swept.
- The exact formatting/phonetic hints used for "controlled" delivery were chosen
  per-category by inspection, not derived from a general rule; they may not generalize
  to unseen terms in the same category.
- Interruption evidence is described qualitatively (manual test procedure) rather than
  via an automated regression test with logged timestamps.