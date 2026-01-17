import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";
import "dotenv/config";

export async function supportBot(
	query: string,
	context?: string,
): Promise<string> {
	const { text: response } = await generateText({
		model: openai("gpt-5-mini"),
		system: `Write a draft reply that is:
    - Helpful and correct
    - Professional and empathetic
    - Clearly structured (bullets or short paragraphs)
    - Safe and policy-compliant
    - Responses must be shorter than 100 words.
    - Responses cannot contain new information that is not in the provided context.
    - When you don't have enough information to resolve a customers query tell them that you will raise this issue with your supervisor and get back to them with more details or options.
    Do not ask for passwords or sensitive data.
    Context:${context}`,
		prompt: query,
	});
	return response;
}

async function main() {
	const userInput = process.argv.slice(2);

	if (userInput.length === 0) {
		console.error('Usage: pnpm start "<customer support query>"');
		process.exit(1);
	}

	const inputText = userInput.join(" ");
	console.log("Responding...\n");

	try {
		const response = await supportBot(inputText);
		console.log("Response:");
		console.log(response);
	} catch (error) {
		console.error("Error:", error instanceof Error ? error.message : error);
		process.exit(1);
	}
}

// Only run main() if this file is being executed directly (not imported)
if (require.main === module) {
	main().catch(console.error);
}
