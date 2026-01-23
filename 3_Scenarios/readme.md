`pnpm init`
`pnpm install @langwatch/scenario vitest ai @ai-sdk/openai dotenv`

scenario.config.mjs
```typescript
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
```

tests / vegetarian-recipe.test.ts
```typescript
// vegetarian-recipe.test.ts
import { config } from "dotenv";
import scenario, { type AgentAdapter, AgentRole } from "@langwatch/scenario";
import { describe, it, expect } from "vitest";
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";

// Load environment variables from .env file
config();

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
			agents: [
				vegetarianRecipeAgent,
				scenario.userSimulatorAgent(),
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

````

```bash
"scripts": {
  "test": "npx vitest run tests/vegetarian-recipe.test.ts"
},
```

`pnpm run test`


```bash
✓ tests/vegetarian-recipe.test.ts (1 test) 17387ms
  ✓ Vegetarian Recipe Agent (1)
    ✓ should generate a vegetarian recipe  17386ms

Test Files  1 passed (1)
     Tests  1 passed (1)
  Start at  12:28:30
  Duration  17.86s (transform 19ms, setup 0ms, import 401ms, tests 17.39s, environment 0ms)
```


Include:
Error Recovery
https://langwatch.ai/scenario/basics/writing-scenarios/#error-recovery

Test how agents handle mistakes, you can enforce it to have made a mistake by using a 
ScriptStep, and let the rest play out by itself.


Do this TTD Style
https://langwatch.ai/scenario/best-practices/domain-driven-tdd/
