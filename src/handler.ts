import { APIGatewayProxyHandler } from "aws-lambda";
import * as AWS from "aws-sdk";
import { WordBattleRequest } from "word-battle-types";
import { functionMap } from "./functions";

const ddb = new AWS.DynamoDB.DocumentClient();

export const app: APIGatewayProxyHandler = async (event) => {
  const { funcName, data }: WordBattleRequest = JSON.parse(event.body || "{}");
  return {
    statusCode: 200,
    body: JSON.stringify(await functionMap[funcName]({ ddb })(data as any)),
  };
};
