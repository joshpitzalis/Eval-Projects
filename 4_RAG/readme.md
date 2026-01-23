# Evaluating Your Retrieval Pipeline


Let's create a command line chatbot that answers questions by retrieving information from a knowledge base. The focus is going to be on how we write evaluations for this retieval process in Typescript. 

## Step 0 — Setting up your project

```
mkdir Chatbot
cd Chatbot
pnpm init
```
Install the necessary dependencies (we're going to the ai-sdk and evalite for testing).
```
pnpm add ai @ai-sdk/openai dotenv tsx && pnpm add -D evalite@beta vitest @types/node typescript
```
You will need an LLM API key with some credit on it (I've used [OpenAI](https://platform.openai.com/docs/quickstart) for this walkthrough; use whichever provider you want but just make sure it has an embeddings model).

Once you have the API key, create a .env file and save your API key (please git ignore your .env file if you plan on sharing the code publicly):
```
OPENAI_API_KEY=your_api_key
```

You'll also need a `tsconfig.json`file to configure the TypeScript compiler:
```
{
	"compilerOptions": {
		"target": "ES2022",
		"module": "Preserve",
		"esModuleInterop": true,
		"allowSyntheticDefaultImports": true,
		"strict": true,
		"skipLibCheck": true,
		"forceConsistentCasingInFileNames": true,
		"resolveJsonModule": true,
		"isolatedModules": true,
		"noEmit": true,
		"types": ["node"],
		"lib": ["ES2022"]
	},
	"include": ["src/**/*", "*.ts"],
	"exclude": ["node_modules", "dist"]
}
```

Create an `index.ts` file inside an `src/` folder and then add the following:

```
import { openai } from '@ai-sdk/openai'
import { streamText } from "ai";
import "dotenv/config";

export async function chatBot(userInput: string) {
	const { textStream } = streamText({
		model: anthropic("claude-3-5-haiku-latest"),
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
```

Create a script to run the Support bot in your `package.json`
```
"scripts": {
  "start": "tsx src/index.ts",
},
```

Now run the Chatbot in your terminal `pnpm start something` and you should see a poem stream into your command line.

## Step 1 - Embedding our knowledge base

First we need a knowledge base to retrieve information from.

Let create a new file called `knowledgeBase.json` in our `src` folder and populate it with a bunch FAQ styles questions.

```json
[{"doc_id":"d1","title":"Refund Policy","text":"Refunds are available within 30 days of purchase. After 30 days, refunds are not available, but store credit may be offered at support discretion."},
{"doc_id":"d2","title":"Billing - Duplicate Charges","text":"If a customer is charged twice, request the order ID and the last four digits of the payment method. Confirm duplicate transaction IDs and issue a refund for the duplicate charge within 5-7 business days."},
{"doc_id":"d3","title":"Password Reset","text":"To reset a password, direct the user to the password reset page. Do not request passwords. Ask for the account email and provide secure verification steps."},
{"doc_id":"d4","title":"Privacy - Data Deletion (EU)","text":"EU users may request data deletion. Confirm identity and route the request to the Privacy team. Provide an expected completion timeline of up to 30 days."},
{"doc_id":"d5","title":"Shipping Delays","text":"For late shipments, provide tracking instructions, confirm the shipping address, and offer escalation if the package is delayed more than 7 days beyond the expected delivery date."},
{"doc_id":"d6","title":"Safety Refusals","text":"If a user requests illegal or harmful instructions, refuse clearly, do not provide operational details, and offer safe alternatives or resources."},
{"doc_id":"d7","title":"Account Access Verification","text":"If a user cannot remember the email, request non-sensitive verification signals (e.g., username, approximate creation date) and escalate to support. Do not reveal account details."},
{"doc_id":"d8","title":"Subscription Cancellation","text":"Users can cancel anytime. Billing stops at the end of the current billing cycle. If cancellation occurs after renewal, the subscription remains active until the next renewal date."},
{"doc_id":"d9","title":"Tone Guidelines","text":"Maintain a professional, calm, and empathetic tone. Avoid blame. Acknowledge frustration and provide clear next steps."},
{"doc_id":"d10","title":"Release Process","text":"For releases, freeze merges 48 hours before launch. Prepare release notes by the end of the freeze window. Run regression tests before deployment."},
{"doc_id":"d11","title":"RAG Grounding","text":"A grounded answer cites and aligns with retrieved sources. Hallucinations are claims not supported by retrieved documents."},
{"doc_id":"d12","title":"Escalation Policy","text":"Escalate when a request involves privacy, payment disputes, or account access issues. Provide timelines and reference ID when possible."}
]
```

Then we are going to create an `generateEmbeddings.ts` and add export the following function from it so that we can embed the meaning of each of the FAQ questions. Embeddings allow us to search for information based on its meaning rather than by relying on a keyword search.

```ts
import "dotenv/config";
import { openai } from "@ai-sdk/openai";
import { embedMany } from "ai";
import { readFile, writeFile } from "fs/promises";
import path from "path";

export type Doc = {
	doc_id: string;
	title: string;
	text: string;
};

export type Embeddings = Record<string, number[]>;

export const embedKnowledgeBase = async () => {
	// load the knowledge base
	const FAQ_LOCATION = path.join(process.cwd(), "src", "knowledgeBase.json");
	const content = await readFile(FAQ_LOCATION, "utf8");
	const docs: Doc[] = JSON.parse(content);

	// create the embeddings
	const embeddings: Embeddings = {};
	const result = await embedMany({
		model: openai.embeddingModel("text-embedding-3-small"),
		values: docs.map((doc) => `${doc.title} ${doc.text}`),
		maxRetries: 0,
	});
	const embedManyResult = result.embeddings.map((embedding, index) => ({
		id: docs[index].doc_id,
		embedding,
	}));
	embedManyResult.forEach((embedding) => {
		embeddings[embedding.id] = embedding.embedding;
	});

	// save the embeddings to a new file
	await writeFile("./src/embeddings.json", JSON.stringify(embeddings));
	return embeddings;
};

async function main() {
	try {
		console.log("Generating embeddings for knowledge base...");
		const embeddings = await embedKnowledgeBase();
		console.log(
			`✓ Successfully generated embeddings for ${Object.keys(embeddings).length} documents`,
		);
		console.log("Embeddings saved to embeddings.json");
	} catch (error) {
		console.error(
			"Error generating embeddings:",
			error instanceof Error ? error.message : error,
		);
		process.exit(1);
	}
}

main();
```

Then we create a script for teh embed process in our `package.json`:

```json
"scripts": {
		"start": "tsx src/index.ts",
		"embed": "tsx src/generateEmbeddings.ts"
	}
```

If you run the embedding process `pnpm embed` you should see a new `embeddings.json` file in the `src` folder.

## Step 2 - Building the retieval pipeline

## Step 3 - Writing an eval to test the retrieval process

Next, create a `retri.eval.ts` file inside an `src/` folder and add the following:
```
import { openai } from "@ai-sdk/openai";
import { evalite } from "evalite";
import { answerRelevancy } from "evalite/scorers";
import dataset from "./dataset.json";
import { supportBot } from "./index";

evalite("My Eval", {
	data: dataset.map((item) => ({
		input: {
			user: item.user,
			context: item.context,
		},
	})),

	task: async (input) => supportBot(input.user, input.context),

	scorers: [
		{
		  name: "Relevance",
			scorer: ({ input, output }) =>
				answerRelevancy({
					question: input.user,
					answer: output,
					// @ts-expect-error
					model: openai("gpt-5-mini"),
					// @ts-expect-error
					embeddingModel: openai.embedding("text-embedding-3-small"),
				}),
		},
	],
});
```
Now, run your evals `pnpm run eval`, and you should see the AI model's responses in your console. If everything is set up correctly, you should see a suite of evaluation results in your console. I got a 58% pass rate when I ran this.





chunking

query rewriter
