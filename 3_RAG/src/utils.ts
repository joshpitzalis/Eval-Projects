import { cosineSimilarity } from "ai";

export const calculateMatch = (
	queryEmbedding: number[],
	embedding: number[],
): number => {
	return cosineSimilarity(queryEmbedding, embedding);
};
