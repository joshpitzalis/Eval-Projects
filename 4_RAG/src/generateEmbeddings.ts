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
