import { generateText } from "ai";
import "dotenv/config";

export async function summarize(text: string): Promise<string> {
  const { text: summary } = await generateText({
    model: "anthropic/claude-sonnet-4.5",

    prompt: `Summarize the following text concisely:\n\n${text}`,

    // prompt: `You will be summarizing a text passage. Here is the text you need to summarize:
    // <text>
    // ${text}
    // </text>
    // Please provide a concise summary of this text. Your summary should:
    // - Capture the main points and key information from the original text
    // - Be significantly shorter than the original while retaining the essential meaning
    // - Use clear, straightforward language
    // - Omit minor details, examples, and redundant information
    // - Be written in complete sentences

    // Write your summary directly as your response. Do not include any preamble or meta-commentary about the summarization task itself.`,
  });

  return summary;
}

async function main() {
  const userInput = process.argv.slice(2);

  if (userInput.length === 0) {
    console.error('Usage: npm start "<text to summarize>"');
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

// Only run main() if this file is being executed directly (not imported)
if (require.main === module) {
  main();
}
