import { openai } from "@ai-sdk/openai";
import { generateText, Output } from "ai";
import { evalite } from "evalite";
import { exactMatch } from "evalite/scorers/deterministic";
import { z } from "zod";
import { devSet, testSet, trainingSet } from "./alignment-datasets";
import { JUDGE_PROMPT } from "./judge.eval";

evalite("TPR/TNR calculator", {
	data: testSet.map((item) => ({
		input: {
			user: item.user,
			context: item.context,
			output: item.output,
		},
		expected: item.expected,
	})),

	task: async (input) => {
		const result = await generateText({
			model: openai("gpt-5-mini"),
			output: Output.object({
				schema: z.object({
					score: z.number().min(0).max(1),
					reason: z.string().max(200),
				}),
			}),
			prompt: JUDGE_PROMPT(input, input.output),
		});

		const { score, reason } = result.output;

		return {
			score,
			metadata: {
				reason: reason,
			},
		};
	},

	scorers: [
		{
			name: "TPR",
			scorer: ({ output, expected }) => {
				// Only score when expected value is 1
				if (expected !== 1) {
					return 1;
				}
				return exactMatch({
					actual: output.score.toString(),
					expected: expected.toString(),
				});
			},
		},

		{
			name: "TNR",
			scorer: ({ output, expected }) => {
				// Only score when expected value is 0
				if (expected !== 0) {
					return 1;
				}
				return exactMatch({
					actual: output.score.toString(),
					expected: expected.toString(),
				});
			},
		},
	],
});
