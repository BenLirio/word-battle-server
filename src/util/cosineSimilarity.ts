import { COSINE_SIMILARITY_THRESHOLDS } from "src/constants";

export const areEmbeddingsSimilar = (
  embedding1: number[],
  embedding2: number[],
  threshold = COSINE_SIMILARITY_THRESHOLDS.HIGH_SIMILARITY
) => {
  const dotProduct = embedding1.reduce(
    (sum: number, value: number, index: number) =>
      sum + value * embedding2[index],
    0
  );
  const magnitude1 = Math.sqrt(
    embedding1.reduce((sum: number, value: number) => sum + value * value, 0)
  );
  const magnitude2 = Math.sqrt(
    embedding2.reduce((sum: number, value: number) => sum + value * value, 0)
  );
  const similarity = dotProduct / (magnitude1 * magnitude2);
  return similarity > threshold;
};
