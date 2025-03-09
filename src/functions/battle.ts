import { TABLE_NAME } from "src/constants";
import { FunctionContext } from "src/types";
import { GetUserRequest, GetUserResponse, UserRecord } from "word-battle-types";
import { BattleRequest, BattleResponse } from "word-battle-types/dist/battle";

const OpenAI = require("openai");

export const getUser =
  ({ ddb }: FunctionContext) =>
  async ({ uuid }: GetUserRequest): Promise<GetUserResponse> => {
    const userParams = {
      TableName: TABLE_NAME,
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

export const battle =
  ({ ddb }: FunctionContext) =>
  async ({ uuid }: BattleRequest): Promise<BattleResponse> => {
    const userParams = {
      TableName: TABLE_NAME,
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

    // Fetch all users (this is just an example, in a real scenario you might want to use a more efficient query)
    const allUsersResult = await ddb.scan({ TableName: TABLE_NAME }).promise();
    const allUsers = allUsersResult.Items as UserRecord[];

    // Filter out the current user
    const opponents = allUsers.filter((user) => user.uuid !== uuid);

    if (opponents.length === 0) {
      throw new Error("No opponents found");
    }

    // Pick a random opponent
    const randomOpponent =
      opponents[Math.floor(Math.random() * opponents.length)];

    // Randomly decide the winner
    const winner = Math.random() < 0.5 ? userRecord : randomOpponent;
    const loser = winner === userRecord ? randomOpponent : userRecord;

    // Adjust elo scores
    winner.elo += 10;
    loser.elo -= 10;

    // Update the users in the database
    await ddb.put({ TableName: TABLE_NAME, Item: winner }).promise();
    await ddb.put({ TableName: TABLE_NAME, Item: loser }).promise();

    return {
      userRecord,
      otherUserRecord: randomOpponent,
      winnerUserRecord: winner,
      loserUserRecord: loser,
      message: `${winner.username} won against ${loser.username}`,
    };
  };
