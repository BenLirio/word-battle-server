import { v4 as uuidv4 } from "uuid";
import AWS from "aws-sdk";
import { FunctionContext } from "src/types";
import {
  RegisterUserRequest,
  RegisterUserResponse,
  UserRecord,
} from "word-battle-types";

const TableName = "word-battle-db";

const createUserInDatabase =
  ({ ddb }: FunctionContext) =>
  async ({
    uuid,
    username,
    word,
  }: {
    uuid: string;
    username: string;
    word: string;
  }) => {
    const userRecord: UserRecord = {
      uuid,
      username,
      word,
      elo: 1000,
    };
    const userParams = {
      TableName,
      Item: {
        hashKey: uuid,
        sortKey: uuid,
        ...userRecord,
      },
    };

    await ddb.put(userParams).promise();

    return userRecord;
  };

export const registerUser =
  (ctxt: FunctionContext) =>
  async ({
    username,
    word,
  }: RegisterUserRequest): Promise<RegisterUserResponse> => {
    const uuid = uuidv4();
    return {
      userRecord: await createUserInDatabase(ctxt)({ uuid, username, word }),
    };
  };
