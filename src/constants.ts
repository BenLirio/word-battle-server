export const TABLE_NAME = "word-battle-db";
export const HISTORY_TABLE_NAME = "word-battle-battles-db";
export const EMBEDDINGS_BUCKET_NAME = "word-battle-embeddings";

export const COSINE_SIMILARITY_THRESHOLDS = {
  IDENTICAL: 0.9,
  HIGH_SIMILARITY: 0.8,
  MODERATE_SIMILARITY: 0.7,
  LOW_SIMILARITY: 0.6,
};

export const MAX_WORD_LENGTH = 50;
export const MAX_USERNAME_LENGTH = 20;
export const MIN_WORD_LENGTH = 3;
export const MIN_USERNAME_LENGTH = 3;
export const INITIAL_ELO = 1000;
