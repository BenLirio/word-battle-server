import { APIGatewayProxyHandler } from "aws-lambda";
import { FunctionInvocationRequest, FunctionInvocationResponse } from "./types";
import { functionMap, inputValidationMap } from "./functions";
import * as AWS from "aws-sdk";

const ddb = new AWS.DynamoDB.DocumentClient();

export const app: APIGatewayProxyHandler = async (event) => {
  const { type, input }: FunctionInvocationRequest = JSON.parse(
    event.body || "{}"
  );
  if (input === undefined) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: "Input is required",
      }),
    };
  }
  if (type === undefined) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: "Type is required",
      }),
    };
  }

  if (!(type in functionMap)) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: "Invalid function type type",
      }),
    };
  }
  if (inputValidationMap[type](input) === false) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: "Invalid input",
      }),
    };
  }

  const result: FunctionInvocationResponse = {
    type,
    output: await functionMap[type](ddb)(input),
  };
  return {
    statusCode: 200,
    body: JSON.stringify(result),
  };
};
