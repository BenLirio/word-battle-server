import { APIGatewayProxyEvent } from "aws-lambda";
import * as AWS from "aws-sdk";
import { WordBattleRequest } from "word-battle-types";
import { functionMap } from "./functions";

const SHARED_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Credentials": true,
  "Access-Control-Allow-Headers": "Content-Type,Authorization,X-Api-Key",
};

const ddb = new AWS.DynamoDB.DocumentClient();

const handleOptions = () => ({
  statusCode: 200,
  headers: {
    "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
    ...SHARED_HEADERS,
  },
  body: "",
});

const handleFailure = (error: any) => ({
  statusCode: 500,
  headers: {
    ...SHARED_HEADERS,
  },
  body: JSON.stringify({ error: error.message }),
});

export const app: any = async (event: APIGatewayProxyEvent) => {
  console.log("event", event);
  if (event.httpMethod === "OPTIONS") {
    return handleOptions();
  }

  const { funcName, data }: WordBattleRequest = JSON.parse(event.body || "{}");
  try {
    const response = await functionMap[funcName]({ ddb })(data as any);
    console.log({
      funcName,
      input: data,
      response,
    });
    return {
      statusCode: 200,
      headers: {
        ...SHARED_HEADERS,
      },
      body: JSON.stringify(response),
    };
  } catch (e: any) {
    console.error(e);
    return handleFailure(e);
  }
};
