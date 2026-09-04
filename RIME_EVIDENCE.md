# Rime Evidence: Pronunciation and Controlled Delivery

## Hard Voice Claim
Naive, unformatted identifiers (order numbers, phone numbers, addresses, drug names, confirmation codes) are harder to understand when spoken by TTS than the same identifiers reformatted for clear, character-by-character delivery.

## Acceptance Test
For 5 representative tricky strings, generate two Rime TTS outputs per string:
1. **Naive** — the identifier written as a normal string (e.g. "AB4471Z")
2. **Controlled** — the identifier reformatted with explicit separation (e.g. "A, B, 4, 4, 7, 1, Z")

Model and speaker held constant across both versions (`coda` / `celeste`) to isolate the effect of text formatting alone.

## Procedure
1. Test strings defined in `evidence/test-strings.json`
2. Run `node src/generate-evidence.js`
3. Both naive and controlled audio are generated using identical Rime model/speaker settings
4. Listen to each pair back-to-back

## Test Cases
| ID | Naive Text | Controlled Text |
|---|---|---|
| order_id | "Your order number is AB4471Z." | "Your order number is A, B, 4, 4, 7, 1, Z." |
| phone | "Call us at 8887324551." | "Call us at 888, 732, 4551." |
| address | "Deliver to 221B Baker Street." | "Deliver to 221 B, Baker Street." |
| drug_name | "Take Levothyroxine daily." | "Take Levo-thy-roxine daily." |
| confirmation_code | "Your code is 9X7K2." | "Your code is 9, X, 7, K, 2." |

## Result
Across all 5 test cases, the controlled versions produced noticeably clearer, more intelligible spoken output than the naive versions, particularly for the order ID, phone number, and confirmation code cases where digit/letter sequences were run together and harder to parse in the naive version. Audio clips for both versions are committed in `evidence/naive/` and `evidence/controlled/` for direct comparison.

## Limitations
- Evaluation was subjective/listening-based rather than using an automated intelligibility metric (e.g. word error rate via re-transcription)
- Small sample size (5 cases) — findings should be treated as illustrative rather than statistically rigorous
- Did not test Rime's custom pronunciation bracket feature (`phonemizeBetweenBrackets`) as an alternative approach — noted as a possible extension