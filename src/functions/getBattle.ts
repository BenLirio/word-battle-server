import { translateText } from "src/ai/translateText";
import { HISTORY_TABLE_NAME } from "src/constants";
import { saveTranslation } from "src/localization/cache";
import {
  DEFAULT_LANGUAGE,
  normalizeLanguage,
} from "src/localization/languages";
import { DBBattleRecord, FunctionContext } from "src/types";
import { UserRecord } from "word-battle-types";
import {
  GetBattleRequest,
  GetBattleResponse,
} from "word-battle-types/dist/getBattle";

// Returns the reason in the viewer's language, translating and caching it the
// first time a battle is opened in that language.
const localizeMessage =
  (ctxt: FunctionContext) =>
  async (record: DBBattleRecord, language: string | undefined) => {
    const messageLanguage = record.messageLanguage || DEFAULT_LANGUAGE;
    if (!language || language === messageLanguage) {
      return record.battleDescription;
    }
    const cached = record.messageTranslations?.[language];
    if (cached !== undefined) return cached;
    const { translation } = await translateText(ctxt)(
      record.battleDescription,
      language,
    );
    await saveTranslation(ctxt)({
      TableName: HISTORY_TABLE_NAME,
      Key: { hashKey: record.hashKey, sortKey: record.sortKey },
      mapAttribute: "messageTranslations",
      language,
      translation,
    });
    return translation;
  };

export const getBattle =
  (ctxt: FunctionContext) =>
  async ({
    uuid,
    timestamp,
    locale,
  }: GetBattleRequest & { locale?: string }): Promise<
    GetBattleResponse & { originalMessage: string; messageLanguage: string }
  > => {
    const { ddb } = ctxt;
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
      message: await localizeMessage(ctxt)(
        DBBattleRecord,
        normalizeLanguage(locale),
      ),
      originalMessage: DBBattleRecord.battleDescription,
      messageLanguage: DBBattleRecord.messageLanguage || DEFAULT_LANGUAGE,
    };
  };
