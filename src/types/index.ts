import OpenAI from "openai";
import { UserRecord } from "word-battle-types";

export interface FunctionContext {
  ddb: AWS.DynamoDB.DocumentClient;
  s3: AWS.S3;
  openai: OpenAI;
}

export interface DBBattleRecord {
  hashKey: string;
  sortKey: number;
  user: string;
  opponent: string;
  winner: string;
  loser: string;
  eloChange: number;
  battleDescription: string;
}
