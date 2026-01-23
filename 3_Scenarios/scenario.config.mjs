// scenario.config.mjs
import { config } from "dotenv";
import { defineConfig } from "@langwatch/scenario";
import { openai } from "@ai-sdk/openai";

// Load environment variables
config();

export default defineConfig({
	defaultModel: {
		model: openai("gpt-4o-mini"),
	},
});
