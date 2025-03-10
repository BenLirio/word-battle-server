import { TABLE_NAME } from "src/constants";
import { FunctionContext } from "src/types";
import { GetUserRequest, GetUserResponse, UserRecord } from "word-battle-types";
import { zodResponseFormat } from "openai/helpers/zod";
import { BattleRequest, BattleResponse } from "word-battle-types/dist/battle";
import OpenAI from "openai";
import { z } from "zod";

const openai = new OpenAI();

const AIResponse = z.object({
  firstPlayerWon: z.boolean(),
  battleDescription: z.string(),
});

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

    // Use OpenAI to determine the winner and generate a message
    const completion = await openai.beta.chat.completions.parse({
      model: "gpt-4o-2024-08-06",
      messages: [
        { role: "system", content: "Determine the winner of the battle" },
        {
          role: "user",
          content: `First players word: "${userRecord.word}", Second players word: "${randomOpponent.word}". In a battle between "${userRecord.word}" and "${randomOpponent.word}", who would win? Give me a fun creative description of the battle along with who win. The description should be around 3-4 sentences.`,
        },
      ],
      response_format: zodResponseFormat(AIResponse, "event"),
    });

    const firstPlayerWon =
      completion.choices[0].message.parsed?.firstPlayerWon!;
    const winner = firstPlayerWon ? userRecord : randomOpponent;
    const loser = firstPlayerWon ? randomOpponent : userRecord;

    // Adjust elo scores
    winner.elo += 10;
    loser.elo -= 10;

    // Update the users in the database
    await ddb.put({ TableName: TABLE_NAME, Item: winner }).promise();
    await ddb.put({ TableName: TABLE_NAME, Item: loser }).promise();

    const battleDescription =
      completion.choices[0].message.parsed?.battleDescription!;
    return {
      userRecord,
      otherUserRecord: randomOpponent,
      winnerUserRecord: winner,
      loserUserRecord: loser,
      message: battleDescription,
    };
  };
