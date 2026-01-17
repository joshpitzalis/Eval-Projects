import { openai } from "@ai-sdk/openai";
import { generateText, Output } from "ai";
import { evalite } from "evalite";
import { z } from "zod";
import dataset from "./dataset.json";
import { supportBot } from "./index";

export const JUDGE_PROMPT = (
	input: {
		user: string;
		context: string;
	},
	output: string,
) => `You are a strict evaluation judge.
   Score the assistant response for acceptability.
   Answer 1 for acceptable and 0 for unacceptable.
   Also provide a short justification for the score.

   Criteria for Acceptability:
   - Responses must be shorter than 100 words.
   - If there is not enough information to resolve a query it is acceptable to raise the issue with a supervisor for further details or options.
   - Responses cannot contain new information that is not in the provided context: ${input.user} ${input.context}

   Examples:
   [
	{
		user: "I was charged twice for my subscription. Fix it.",
		context:
			"You are a support assistant for Acme. Ask for needed info and provide next steps.",
		output:
			"I understand you were charged twice for your subscription. I'm here to help fix this. To investigate and process a refund, I need a few details:\n\n- Your account email address\n- Order or invoice numbers for both charges\n- Approximate dates of the charges\n\nOnce I have this information, I can review your billing history and submit a request to our billing team to process the duplicate charge refund. This typically takes 3-5 business days to complete.\n\nDo you have these details available?",
		expected: 0,
		reason: This is unacceptable because the support bot invents stuff being able to review the billing history or refunds taking 3-5 business days to complete.
	},
	{
		user: "How do I reset my password?",
		context:
			"Password resets can be done via the 'Forgot Password' link on the login page. Users will receive a reset email within 5 minutes.",
		output:
			"To reset your password:\n\n- Click 'Forgot Password' on the login page\n- You'll receive a reset email within 5 minutes\n- Follow the link in that email to create a new password\n\nIf you don't receive the email, please check your spam folder.",
		expected: 1,
	},
	{
		user: "My order hasn't arrived yet. Where is it?",
		context:
			"Standard shipping takes 5-7 business days. Express shipping takes 2-3 business days. Tracking information is sent via email after shipment.",
		output:
			"I can help you track your order. Could you please provide your order number? Once I have that, I can look up the shipping status and estimated delivery date for you.",
		expected: 0,
			reason: This is unacceptable because the support bot invents stuff being able to look up the shipping status.
	},
	{
		user: "Can I upgrade my plan?",
		context:
			"Plans can be upgraded anytime from the Account Settings page under 'Billing'. Upgrades are prorated and take effect immediately.",
		output:
			"Yes! You can upgrade your plan anytime:\n\n- Go to Account Settings\n- Select 'Billing'\n- Choose your new plan\n\nUpgrades are prorated and take effect immediately. You'll only pay the difference for the remaining billing period.",
		expected: 1,
	},
   ];

   :\n\n Output: ${output}\n`;

evalite.skip("My Eval", {
	data: dataset.map((item) => ({
		input: {
			user: item.user,
			context: item.context,
		},
	})),

	task: async (input) => supportBot(input.user, input.context),

	scorers: [
		{
			name: "Acceptability",
			scorer: async ({ output, input }) => {
				const result = await generateText({
					model: openai("gpt-5-mini"),
					output: Output.object({
						schema: z.object({
							score: z.number().min(0).max(1),
							reason: z.string().max(200),
						}),
					}),
					prompt: JUDGE_PROMPT(input, output),
				});

				const { score, reason } = result.output;

				return {
					score,
					metadata: {
						reason: reason ?? null,
					},
				};
			},
		},
	],
});
