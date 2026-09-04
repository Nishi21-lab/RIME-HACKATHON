# Rime Evidence: Pronunciation Clarity via Speed Control

## Hard Voice Claim
The same word or phrase, rendered by Rime at a slower speed (`timeScaleFactor: 1.6`), gives noticeably clearer syllable-by-syllable separation than the identical phrase at normal speed (`timeScaleFactor: 1.0`) — making it more useful as a pronunciation model for a learner practicing a new or difficult word.

## Acceptance Test
For 6 representative words/phrases of varying difficulty, generate two Rime TTS outputs per item:
1. **Normal** — `timeScaleFactor: 1.0`
2. **Slow** — `timeScaleFactor: 1.6`

Voice, model, and language held constant across both versions (`celeste` / `coda` / `en`) to isolate the effect of speed alone.

## Procedure
1. Test phrases defined in `evidence/test-strings.json`
2. Run `node src/generate-evidence.js`
3. Both normal and slow audio are generated using identical Rime voice/model settings, differing only in `timeScaleFactor`
4. Listen to each pair back-to-back

## Test Cases
| ID | Phrase | Normal `timeScaleFactor` | Slow `timeScaleFactor` |
|---|---|---|---|
| butterfly | "Butterfly" | 1.0 | 1.6 |
| spaghetti | "Spaghetti" | 1.0 | 1.6 |
| refrigerator | "Refrigerator" | 1.0 | 1.6 |
| unicorn | "Unicorn" | 1.0 | 1.6 |
| chocolate | "Chocolate" | 1.0 | 1.6 |
| peculiar | "Peculiar" | 1.0 | 1.6 |

## Result
Across all 6 test cases, the slow-speed versions produced audibly more distinct syllable boundaries than the normal-speed versions, most noticeably on the higher-syllable-count words (`refrigerator`, `peculiar`) where syllables blend together more at normal speed. Audio clips for both versions are committed in `evidence/normal/` and `evidence/slow/` for direct comparison.

## Interruption and Recovery — Supplementary Evidence
In addition to the speed-control claim above, the product also handles mid-playback interruption:
- Tapping the mic while audio is playing immediately pauses playback and aborts the in-flight fetch to Rime via `AbortController`.
- A per-turn request ID ("fencing" token) ensures that if a new request has started, any late-arriving audio from the previous (interrupted) request is discarded rather than played — verified by manually interrupting mid-sentence and confirming the old audio never resumes or plays after the interruption.

## Limitations
- Evaluation of speed-clarity was subjective/listening-based rather than using an automated intelligibility metric (e.g. word error rate via re-transcription).
- Small sample size (6 items) — findings should be treated as illustrative rather than statistically rigorous.
- `timeScaleFactor` of 1.6 was chosen empirically as a "clearly slower but still natural-sounding" value; other values were not systematically swept.
- Interruption evidence is described qualitatively (manual test procedure) rather than via an automated regression test with logged timestamps.