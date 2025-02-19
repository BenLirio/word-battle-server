import { v4 as uuidv4 } from "uuid";
import AWS from "aws-sdk";

const TableName = "word-battle-db";

const createUserInDatabase =
  (ddb: AWS.DynamoDB.DocumentClient) =>
  async ({
    uuid,
    username,
    word,
  }: {
    uuid: string;
    username: string;
    word: string;
  }) => {
    // Check if username already exists
    const record = {
      uuid,
      username,
      word,
    };
    const usernameParams = {
      TableName,
      Key: {
        hashKey: `username:${username}`,
        sortKey: username,
      },
    };
    const wordParams = {
      TableName,
      Key: {
        hashKey: `word:${word}`,
        sortKey: word,
      },
    };

    const usernameResult = await ddb.get(usernameParams).promise();

    if (usernameResult.Item) {
      // Username already exists, abort the function
      throw new Error("Username already exists");
    }

    const wordResult = await ddb.get(wordParams).promise();

    if (wordResult.Item) {
      // Word already exists, abort the function
      throw new Error("Word already exists");
    }

    // Create the user records
    const userParams = {
      TableName,
      Item: {
        hashKey: `uuid:${uuid}`,
        sortKey: uuid,
        ...record,
      },
    };

    const usernameRecordParams = {
      TableName,
      Item: {
        hashKey: `username:${username}`,
        sortKey: username,
        ...record,
      },
    };

    const wordRecordParams = {
      TableName,
      Item: {
        hashKey: `word:${word}`,
        sortKey: word,
        ...record,
      },
    };

    await ddb.put(userParams).promise();
    await ddb.put(usernameRecordParams).promise();
    await ddb.put(wordRecordParams).promise();

    return {
      uuid,
      username,
      word,
    };
  };

export const registerUser =
  (ddb: AWS.DynamoDB.DocumentClient) =>
  async ({ username, word }: { username: string; word: string }) => {
    const uuid = uuidv4();
    return await createUserInDatabase(ddb)({ uuid, username, word });
  };
