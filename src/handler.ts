import { APIGatewayProxyEvent } from "aws-lambda";
import * as AWS from "aws-sdk";
import { WordBattleRequest } from "word-battle-types";
import { functionMap } from "./functions";

const ddb = new AWS.DynamoDB.DocumentClient();

export const app: any = async (event: APIGatewayProxyEvent) => {
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type,Authorization,X-Api-Key",
        "Access-Control-Allow-Credentials": true,
      },
      body: "",
    };
  }

  const { funcName, data }: WordBattleRequest = JSON.parse(event.body || "{}");
  try {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*", // Or specify your domain
        "Access-Control-Allow-Credentials": true,
        "Access-Control-Allow-Headers": "Content-Type,Authorization,X-Api-Key",
      },
      body: JSON.stringify(await functionMap[funcName]({ ddb })(data as any)),
    };
  } catch (e: any) {
    console.error(e);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*", // Or specify your domain
        "Access-Control-Allow-Credentials": true,
        "Access-Control-Allow-Headers": "Content-Type,Authorization,X-Api-Key",
      },
      body: JSON.stringify({ error: e.message }),
    };
  }
};
