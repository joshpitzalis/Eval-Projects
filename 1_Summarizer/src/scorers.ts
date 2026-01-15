import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import { createScorer } from "evalite";

export const clarity = createScorer({
	name: "Clarity",
	description: "Easy to scan; clear structure",
	scorer: async ({ output }: { output: string }) => {
		const { text } = await generateText({
			model: google("gemini-2.5-flash-lite"),
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
			model: google("gemini-2.5-flash-lite"),
			prompt: `Rate the output coverage from 0 to 1 based on whether it includes the 3–5 most important points from the input. Return only the score expressed as a number and nothing else :\n\n Output: ${output}\n Input: ${input}`,
		});

		const score = parseFloat(text);
		return score;
	},
});
