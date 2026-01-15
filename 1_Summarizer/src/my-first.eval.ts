import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import { evalite } from "evalite";
import { faithfulness } from "evalite/scorers";
import dataset from "./dataset.json";
import { clarity, coverage } from "./scorers";

evalite.each([
	{
		name: "Variant A",
		input: {
			prompt: (text: string) =>
				`Summarize the following text concisely:\n\n${text}`,
		},
	},
	{
		name: "Variant B",
		input: {
			prompt: (text: string) =>
				`You will be summarizing a text passage. Here is the text you need to summarize:
    <text>
    ${text}
    </text>
    Please provide a concise summary of this text. Your summary should:
    - Capture the main points and key information from the original text
    - Be significantly shorter than the original while retaining the essential meaning
    - Use clear, straightforward language
    - Omit minor details, examples, and redundant information
    - Be written in complete sentences

    Write your summary directly as your response. Do not include any preamble or meta-commentary about the summarization task itself.`,
		},
	},
])("My First Eval", {
	data: dataset,

	task: async (input, variant) => {
		const { text } = await generateText({
			model: google("gemini-2.5-flash-lite"),
			prompt: variant.prompt(input),
		});

		return text;
	},

	scorers: [
		{
			name: "Faithfulness",
			description: "No new facts, names, numbers, or events not in the source",
			scorer: ({ input, output }) =>
				faithfulness({
					question: input,
					answer: output,
					groundTruth: [input],
					// @ts-expect-error
					model: google("gemini-2.5-flash-lite"),
				}),
		},
		{
			name: "Conciseness",
			description: "Output <= 120 words",
			scorer: ({ output }) => {
				return output.split(" ").length <= 120 ? 1 : 0;
			},
		},
		clarity,
		coverage,
	],
});
