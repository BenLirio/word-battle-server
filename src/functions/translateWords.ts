import { translateText } from "src/ai/translateText";
import { MAX_TRANSLATIONS_PER_REQUEST, TABLE_NAME } from "src/constants";
import { saveTranslation } from "src/localization/cache";
import { normalizeLanguage } from "src/localization/languages";
import { FunctionContext, LocalizedUserRecord } from "src/types";

export interface TranslateWordsRequest {
  uuids: string[];
  locale: string;
}

export interface WordTranslation {
  uuid: string;
  language: string;
  sourceLanguage?: string;
  translation: string;
}

export interface TranslateWordsResponse {
  translations: WordTranslation[];
}

// Returns each entry's word in the viewer's language, translating and caching
// the ones that have not been translated into that language before.
export const translateWords =
  (ctxt: FunctionContext) =>
  async ({
    uuids,
    locale,
  }: TranslateWordsRequest): Promise<TranslateWordsResponse> => {
    const language = normalizeLanguage(locale);
    if (!language) {
      throw new Error(`Unsupported locale ${locale}`);
    }
    if (!Array.isArray(uuids)) {
      throw new Error("uuids must be an array");
    }
    const requested = [
      ...new Set(uuids.filter((uuid) => typeof uuid === "string")),
    ].slice(0, MAX_TRANSLATIONS_PER_REQUEST);
    if (requested.length === 0) {
      return { translations: [] };
    }

    const result = await ctxt.ddb
      .batchGet({
        RequestItems: {
          [TABLE_NAME]: {
            Keys: requested.map((uuid) => ({ hashKey: uuid, sortKey: uuid })),
          },
        },
      })
      .promise();
    const records = (result.Responses?.[TABLE_NAME] ||
      []) as LocalizedUserRecord[];

    const translations = await Promise.all(
      records.map(async (record): Promise<WordTranslation> => {
        const cached = record.translations?.[language];
        if (cached !== undefined) {
          return {
            uuid: record.uuid,
            language,
            sourceLanguage: record.sourceLanguage,
            translation: cached,
          };
        }
        const { sourceLanguage, translation } = await translateText(ctxt)(
          record.word,
          language,
        );
        await saveTranslation(ctxt)({
          TableName: TABLE_NAME,
          Key: { hashKey: record.uuid, sortKey: record.uuid },
          mapAttribute: "translations",
          language,
          translation,
          extraAttributes: { sourceLanguage },
        });
        return {
          uuid: record.uuid,
          language,
          sourceLanguage: record.sourceLanguage || sourceLanguage,
          translation,
        };
      }),
    );

    return { translations };
  };
