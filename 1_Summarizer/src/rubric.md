# Feature: Summarizer

## Expectations
- Must be concise
- Must not hallucinate facts
- Must preserve names, dates, numbers
- Should clearly separate "Summary" and "Action items" when possible
- "I can read this in under 30 seconds"
- "I trust it not to make up details"
- "It highlights what matters most"
- "It tells me what I should do next (if applicable)"
x - No Hallucinations: introduces facts not in source
x - No Missing critical info: leaves out the main decision, dates, or numbers
x - No Overly long: exceeds length cap
x - No Too vague: generic filler ("The author discusses...")
x - No Wrong emphasis: focuses on minor details, misses the key point
x - No Unsafe or sensitive leakage (if input contains private info)



## Success criteria (measurable)

1) ✅ Conciseness
- Output <= 120 words

2) Coverage
- Includes the 3–5 most important points from the input

3) ✅ Faithfulness (No hallucinations)
- No new facts, names, numbers, or events not in the source

4) ✅ Clarity
- Easy to scan; clear structure (bullets or short paragraphs)

5) ✅ Usefulness
- If the input contains tasks/requests, produce action items
