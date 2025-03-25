import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { HISTORY_TABLE_NAME, TABLE_NAME } from "src/constants";
import { DBBattleRecord, FunctionContext } from "src/types";
import { UserRecord } from "word-battle-types";
import { BattleRequest, BattleResponse } from "word-battle-types/dist/battle";
import { z } from "zod";

const AIResponse = z.object({
  firstPlayerWon: z.boolean(),
  reasonForWin: z.string(),
});

const K_FACTOR = 24;

const calculateElo = (
  playerRating: number,
  opponentRating: number,
  score: number
): number => {
  const expectedScore = 1 / (1 + 10 ** ((opponentRating - playerRating) / 400));
  return playerRating + K_FACTOR * (score - expectedScore);
};

export const battle =
  ({ ddb, openai }: FunctionContext) =>
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
    const leaderboard: undefined | string = userRecord.leaderboard;

    if (!userRecord) {
      throw new Error("User not found");
    }

    let scanParams: AWS.DynamoDB.DocumentClient.ScanInput = {
      TableName: TABLE_NAME,
    };

    if (leaderboard) {
      scanParams = {
        ...scanParams,
        FilterExpression: "leaderboard = :leaderboard",
        ExpressionAttributeValues: {
          ":leaderboard": leaderboard,
        },
      };
    } else {
      scanParams = {
        ...scanParams,
        FilterExpression: "attribute_not_exists(leaderboard)",
      };
    }

    // Fetch all users based on leaderboard
    const allUsersResult = await ddb.scan(scanParams).promise();
    const allUsers = allUsersResult.Items as UserRecord[];

    // Filter out the current user
    const opponents = allUsers
      .filter((user) => user.uuid !== uuid)
      .filter(({ elo }) => Math.abs(userRecord.elo - elo) < 200);

    if (opponents.length === 0) {
      throw new Error("No opponents found");
    }

    // Pick a random opponent
    const randomOpponent =
      opponents[Math.floor(Math.random() * opponents.length)];
    const swapOrder = Math.random() < 0.5;

    // Use OpenAI to determine the winner and generate a message
    const completion = await openai.beta.chat.completions.parse({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "Determine the winner of the battle" },
        {
          role: "user",
          content: `First players word: "${
            (swapOrder ? userRecord : randomOpponent).word
          }", Second players word: "${
            (swapOrder ? randomOpponent : userRecord).word
          }". In a battle between "${
            (swapOrder ? userRecord : randomOpponent).word
          }" and "${
            (swapOrder ? randomOpponent : userRecord).word
          }", who would win? Give a one sentence reason why they would win.`,
        },
      ],
      response_format: zodResponseFormat(AIResponse, "event"),
    });

    const eloBefore = userRecord.elo;
    const firstPlayerWon =
      completion.choices[0].message.parsed?.firstPlayerWon! === swapOrder;
    const winner = firstPlayerWon ? userRecord : randomOpponent;
    const loser = firstPlayerWon ? randomOpponent : userRecord;

    // Calculate new Elo scores
    const winnerScore = 1;
    const loserScore = 0;

    winner.elo = calculateElo(winner.elo, loser.elo, winnerScore);
    loser.elo = calculateElo(loser.elo, winner.elo, loserScore);

    const eloChange =
      winner.uuid === userRecord.uuid
        ? winner.elo - eloBefore
        : loser.elo - eloBefore;

    // Update the users in the database
    await ddb.put({ TableName: TABLE_NAME, Item: winner }).promise();
    await ddb.put({ TableName: TABLE_NAME, Item: loser }).promise();

    const battleDescription =
      completion.choices[0].message.parsed?.reasonForWin!;
    const result = {
      userRecord,
      otherUserRecord: randomOpponent,
      winnerUserRecord: winner,
      loserUserRecord: loser,
      eloChange,
      message: battleDescription,
    };
    const timestamp = Date.now();

    // Save the battle result to the history table
    const historyParams: { TableName: string; Item: DBBattleRecord } = {
      TableName: HISTORY_TABLE_NAME,
      Item: {
        hashKey: uuid,
        sortKey: timestamp,
        user: JSON.stringify(userRecord),
        opponent: JSON.stringify(randomOpponent),
        winner: JSON.stringify(winner),
        loser: JSON.stringify(loser),
        eloChange,
        battleDescription,
      },
    };

    await ddb.put(historyParams).promise();

    return {
      ...result,
      timestamp,
    };
  };
