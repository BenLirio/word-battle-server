export interface FunctionContext {
  ddb: AWS.DynamoDB.DocumentClient;
}

export interface BattleRecord {
  hashKey: string;
  sortKey: number;
  user: string;
  opponent: string;
  winner: string;
  loser: string;
  eloChange: number;
  battleDescription: string;
}
