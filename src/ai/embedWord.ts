import { FunctionContext } from "src/types";

export const embedWord =
  ({ openai }: FunctionContext) =>
  async (word: string) => {
    const embedding = await openai.embeddings.create({
      model: "text-embedding-3-large",
      input: word,
      encoding_format: "float",
    });
    return embedding.data[0].embedding;
  };
