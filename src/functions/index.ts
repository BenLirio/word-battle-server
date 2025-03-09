import { FunctionContext } from "src/types";
import { WordBattleFunction, WordBattleFunctionName } from "word-battle-types";
import { getUser } from "./getUser";
import { registerUser } from "./registerUser";
import { listTopUsers } from "./listTopUsers";
import { battle } from "./battle";

export const functionMap: Record<
  WordBattleFunctionName,
  (context: FunctionContext) => WordBattleFunction
> = {
  [WordBattleFunctionName.GET_USER]: getUser,
  [WordBattleFunctionName.REGISTER_USER]: registerUser,
  [WordBattleFunctionName.LIST_TOP_USERS]: listTopUsers,
  [WordBattleFunctionName.BATTLE]: battle,
};
