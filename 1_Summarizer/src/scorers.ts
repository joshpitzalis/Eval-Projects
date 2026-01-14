import { createScorer } from "evalite";
import { generateText } from "ai";

// export const containsActionItems = createScorer({
//   name: `Usefulness`,
//   description: "If the input contains tasks/requests, produce action items",
//   scorer: ({ output }: { output: string }) => {
//     const keywords = [
//       "task",
//       "request",
//       "action item",
//       "tasks",
//       "requests",
//       "action items",
//     ];

//     return keywords.some((keyword) =>
//       output.toLowerCase().includes(keyword.toLowerCase()),
//     )
//       ? 1
//       : 0;
//   },
// });

export const clarity = createScorer({
  name: "Clarity",
  description: "Easy to scan; clear structure (bullets or short paragraphs)",
  scorer: async ({ output }: { output: string }) => {
    const { text } = await generateText({
      model: "anthropic/claude-sonnet-4.5",
      prompt: `Rate the output clarity from 0 to 1 based on how easy to scan, clear structure , bullets or short paragraphs, etc. Return only the score expressed as a number and nothing else :\n\n${output}`,
    });

    const score = parseFloat(text);

    return score;
  },
});

export const coverage = createScorer({
  name: "Coverage",
  description: "Includes the 3–5 most important points from the input",
  scorer: async ({ output, input }: { output: string; input: string }) => {
    const { text } = await generateText({
      model: "anthropic/claude-sonnet-4.5",
      prompt: `Rate the output coverage from 0 to 1 based on whether it includes the 3–5 most important points from the input. Return only the score expressed as a number and nothing else :\n\n Output: ${output}\n Input: ${input}`,
    });

    const score = parseFloat(text);

    return score;
  },
});
