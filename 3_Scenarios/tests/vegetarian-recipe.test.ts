// vegetarian-recipe.test.ts
import { config } from "dotenv";
import scenario, { type AgentAdapter, AgentRole } from "@langwatch/scenario";
import { describe, it, expect } from "vitest";
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";

// Load environment variables from .env file
config();

// 1. Create your agent adapter
const vegetarianRecipeAgent: AgentAdapter = {
	role: AgentRole.AGENT,
	call: async (input) => {
		const response = await generateText({
			model: openai("gpt-4o-mini"),
			messages: [
				{ role: "system", content: "You are a vegetarian recipe agent." },
				...input.messages,
			],
		});
		return response.text;
	},
};

describe("Vegetarian Recipe Agent", () => {
	it("should generate a vegetarian recipe", async () => {
		// 2. Run the scenario
		const result = await scenario.run({
			name: "dinner recipe request",
			description: `It's saturday evening, the user is very hungry and tired, but have no money to order out, so they are looking for a recipe.`,

			// # Scenario: "User is confused about their bill"
			// # → User simulator will ask unclear questions, express confusion

			// # Scenario: "User is an expert developer reporting a bug"
			// # → User simulator will use technical language, provide detailed info

			// # Scenario: "User is elderly and not tech-savvy"
			// # → User simulator will ask basic questions, need more guidance

			agents: [
				vegetarianRecipeAgent,
				scenario.userSimulatorAgent({
					model: "o3", // Use different model
					systemPrompt: `
    <role>
        You are pretending to be a user, you are testing an AI Agent (shown as the user role) based on a scenario.
        Approach this naturally, as a human user would, with very short inputs, few words, all lowercase, imperative, not periods, like when they google or talk to chatgpt.
    </role>

    <goal>
    Your goal (assistant) is to interact with the Agent Under Test (user) as if you were a human user.
    </goal>

    <scenario>
    You are trying to get a refund for a purchase you made.
    You are a busy executive who speaks concisely and directly.
    You get impatient with long explanations and prefer bullet points.
    You often interrupt to ask specific questions.
    </scenario>

    <rules>
    - DO NOT carry over any requests yourself, YOU ARE NOT the assistant today, you are the user
    </rules>
  `,
				}),
				scenario.judgeAgent({
					criteria: [
						"Agent should not ask more than two follow-up questions",
						"Agent should generate a recipe",
						"Recipe should include a list of ingredients",
						"Recipe should include step-by-step cooking instructions",
						"Recipe should be vegetarian and not include any sort of meat",
					],
				}),
			],
			script: [
				scenario.user("quick recipe for dinner"),
				scenario.agent(),
				scenario.user(),
				scenario.agent(),
				scenario.judge(),
			],
		});

		// 3. Assert the result
		expect(result.success).toBe(true);
	}, 30_000); // 30 second test timeout
});
