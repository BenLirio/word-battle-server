import { v4 as uuidv4 } from "uuid";
import AWS from "aws-sdk";

export const registerUser =
  (ddb: AWS.DynamoDB.DocumentClient) =>
  async ({ username, word }: { username: string; word: string }) => {
    const uuid = uuidv4();
    const params = {
      TableName: "word-battle-db",
      Item: {
        hashKey: `user:${uuid}`,
        sortKey: uuid,
        username,
        word,
      },
    };

    await ddb.put(params).promise();

    return {
      uuid,
      username,
      word,
    };
  };
