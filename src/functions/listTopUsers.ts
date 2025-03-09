import { TABLE_NAME } from "src/constants";
import { FunctionContext } from "src/types";
import {
  ListTopUsersRequest,
  ListTopUsersResponse,
  UserRecord,
} from "word-battle-types";

export const listTopUsers =
  ({ ddb }: FunctionContext) =>
  async ({}: ListTopUsersRequest): Promise<ListTopUsersResponse> => {
    const params = {
      TableName: TABLE_NAME,
      Limit: 10,
      ScanIndexForward: false, // Sort in descending order
      IndexName: "elo-index", // Assuming you have a secondary index on the elo field
    };

    const result = await ddb.scan(params).promise();
    const topUsers = result.Items as UserRecord[];

    if (!topUsers || topUsers.length === 0) {
      throw new Error("No users found");
    }

    return {
      userRecords: topUsers,
    };
  };
