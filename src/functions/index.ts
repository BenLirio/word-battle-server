import { FunctionContext } from "src/types";
import { WordBattleFunction, WordBattleFunctionName } from "word-battle-types";
import { registerUser } from "./registerUser";
import { listTopUsers } from "./listTopUsers";
import { battle } from "./battle";
import { getBattle } from "./getBattle";
import { getUser } from "./getUser";

export const functionMap: Record<
  WordBattleFunctionName,
  (context: FunctionContext) => WordBattleFunction
> = {
  [WordBattleFunctionName.GET_USER]: getUser,
  [WordBattleFunctionName.REGISTER_USER]: registerUser,
  [WordBattleFunctionName.LIST_TOP_USERS]: listTopUsers,
  [WordBattleFunctionName.BATTLE]: battle,
  [WordBattleFunctionName.GET_BATTLE]: getBattle,
};
