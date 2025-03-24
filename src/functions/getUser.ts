import { FunctionContext } from "src/types";
import { GetUserRequest, GetUserResponse } from "word-battle-types";
import { getUserRecord } from "./common";

export const getUser =
  (ctxt: FunctionContext) =>
  async ({ uuid }: GetUserRequest): Promise<GetUserResponse> => {
    return {
      userRecord: await getUserRecord(ctxt)(uuid),
    };
  };
