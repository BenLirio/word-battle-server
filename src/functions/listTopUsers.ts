import { TABLE_NAME } from "src/constants";
import { FunctionContext } from "src/types";
import {
  ListTopUsersRequest,
  ListTopUsersResponse,
  UserRecord,
} from "word-battle-types";

export const listTopUsers =
  ({ ddb }: FunctionContext) =>
  async ({
    leaderboard,
  }: ListTopUsersRequest): Promise<ListTopUsersResponse> => {
    let params: AWS.DynamoDB.DocumentClient.ScanInput = {
      TableName: TABLE_NAME,
    };

    if (leaderboard) {
      params = {
        ...params,
        FilterExpression: "leaderboard = :leaderboard",
        ExpressionAttributeValues: {
          ":leaderboard": leaderboard,
        },
      };
    } else {
      params = {
        ...params,
        FilterExpression: "attribute_not_exists(leaderboard)",
      };
    }

    const result = await ddb.scan(params).promise();
    const allUsers = result.Items as UserRecord[];

    if (!allUsers || allUsers.length === 0) {
      throw new Error("No users found");
    }

    // Sort users by elo in descending order
    const sortedUsers = allUsers.sort((a, b) => b.elo - a.elo);

    return {
      userRecords: sortedUsers,
    };
  };
