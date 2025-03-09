import { FunctionContext } from "src/types";
import { GetUserRequest, GetUserResponse, UserRecord } from "word-battle-types";

const TableName = "word-battle-db";

export const getUser =
  ({ ddb }: FunctionContext) =>
  async ({ uuid }: GetUserRequest): Promise<GetUserResponse> => {
    const userParams = {
      TableName,
      Key: {
        hashKey: uuid,
        sortKey: uuid,
      },
    };

    const userResult = await ddb.get(userParams).promise();
    const userRecord = userResult.Item as UserRecord;

    if (!userRecord) {
      throw new Error("User not found");
    }

    return {
      userRecord,
    };
  };
