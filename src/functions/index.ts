import { FunctionContext } from "src/types";
import { WordBattleFunction, WordBattleFunctionName } from "word-battle-types";
import { registerUser } from "./registerUser";
import { listTopUsers } from "./listTopUsers";
import { battle } from "./battle";
import { getBattle } from "./getBattle";
import { getUser } from "./getUser";
import { translateWords } from "./translateWords";

// Not in word-battle-types yet; the client sends the same string.
export const TRANSLATE_WORDS = "TRANSLATE_WORDS";

export const functionMap: Record<
  WordBattleFunctionName | typeof TRANSLATE_WORDS,
  (
    context: FunctionContext,
  ) => WordBattleFunction | ReturnType<typeof translateWords>
> = {
  [WordBattleFunctionName.GET_USER]: getUser,
  [WordBattleFunctionName.REGISTER_USER]: registerUser,
  [WordBattleFunctionName.LIST_TOP_USERS]: listTopUsers,
  [WordBattleFunctionName.BATTLE]: battle,
  [WordBattleFunctionName.GET_BATTLE]: getBattle,
  [TRANSLATE_WORDS]: translateWords,
};
