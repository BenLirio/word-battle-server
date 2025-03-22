import { HISTORY_TABLE_NAME } from "src/constants";
import { BattleRecord, FunctionContext } from "src/types";
import { UserRecord } from "word-battle-types";
import {
  GetBattleRequest,
  GetBattleResponse,
} from "word-battle-types/dist/getBattle";

export const getBattle =
  ({ ddb }: FunctionContext) =>
  async ({ uuid, timestamp }: GetBattleRequest): Promise<GetBattleResponse> => {
    const battleParams = {
      TableName: HISTORY_TABLE_NAME,
      Key: {
        hashKey: uuid,
        sortKey: timestamp,
      },
    };

    const battleResult = await ddb.get(battleParams).promise();
    const battleRecord = battleResult.Item as BattleRecord;

    if (!battleRecord) {
      throw new Error("Battle not found");
    }

    return {
      userRecord: JSON.parse(battleRecord.user) as UserRecord,
      otherUserRecord: JSON.parse(battleRecord.opponent) as UserRecord,
      winnerUserRecord: JSON.parse(battleRecord.winner) as UserRecord,
      loserUserRecord: JSON.parse(battleRecord.loser) as UserRecord,
      eloChange: battleRecord.eloChange,
      message: battleRecord.battleDescription,
    };
  };
