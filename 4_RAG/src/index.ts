import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";
import "dotenv/config";

export async function chatBot(userInput: string) {
	const { textStream } = streamText({
		model: openai("gpt-5-mini"),
		system: "Write a poem about embedding models.",
		prompt: userInput,
	});

	for await (const textPart of textStream) {
		process.stdout.write(textPart);
	}
	process.stdout.write("\n");
}

async function main() {
	const userInput = process.argv.slice(2);

	if (userInput.length === 0) {
		console.error('Usage: pnpm start "something"');
		process.exit(1);
	}

	const inputText = userInput.join(" ");

	try {
		await chatBot(inputText);
	} catch (error) {
		console.error("Error:", error instanceof Error ? error.message : error);
		process.exit(1);
	}
}

// Only run main() if this file is being executed directly (not imported)
if (require.main === module) {
	main().catch(console.error);
}
