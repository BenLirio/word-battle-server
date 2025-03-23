import { HISTORY_TABLE_NAME } from "src/constants";
import { DBBattleRecord, FunctionContext } from "src/types";
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
    const DBBattleRecord = battleResult.Item as DBBattleRecord;

    if (!DBBattleRecord) {
      throw new Error("Battle not found");
    }

    return {
      userRecord: JSON.parse(DBBattleRecord.user) as UserRecord,
      otherUserRecord: JSON.parse(DBBattleRecord.opponent) as UserRecord,
      winnerUserRecord: JSON.parse(DBBattleRecord.winner) as UserRecord,
      loserUserRecord: JSON.parse(DBBattleRecord.loser) as UserRecord,
      eloChange: DBBattleRecord.eloChange,
      message: DBBattleRecord.battleDescription,
    };
  };
