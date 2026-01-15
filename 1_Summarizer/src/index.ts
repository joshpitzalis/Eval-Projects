import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import "dotenv/config";

export async function summarize(text: string): Promise<string> {
	const { text: summary } = await generateText({
		model: google("gemini-2.5-flash-lite"),
		prompt: `Summarize the following text concisely:\n\n${text}`,
	});

	return summary;
}

async function main() {
	const userInput = process.argv.slice(2);

	if (userInput.length === 0) {
		console.error('Usage: pnpm start "<text to summarize>"');
		process.exit(1);
	}

	const inputText = userInput.join(" ");
	console.log("Summarizing...\n");

	try {
		const summary = await summarize(inputText);
		console.log("Summary:");
		console.log(summary);
	} catch (error) {
		console.error("Error:", error instanceof Error ? error.message : error);
		process.exit(1);
	}
}

main().catch(console.error);
