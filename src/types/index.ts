export enum FunctionType {
  RegisterUser = "registerUser",
}

export type RegisterUserInput = {
  username: string;
  word: string;
};
export const isRegisterUserInput = (
  input: unknown
): input is RegisterUserInput => {
  if (typeof input !== "object" || input === null) {
    return false;
  }
  if (typeof (input as RegisterUserInput).username !== "string") {
    return false;
  }
  if (typeof (input as RegisterUserInput).word !== "string") {
    return false;
  }
  return true;
};

export type RegisterUserOutput = {
  uuid: string;
  username: string;
  word: string;
};

export type FunctionInput = RegisterUserInput;
export type FunctionOutput = RegisterUserOutput;
export type Function = (
  ddb: AWS.DynamoDB.DocumentClient
) => (input: FunctionInput) => Promise<FunctionOutput>;

export type FunctionInvocationRequest = {
  type: FunctionType;
  input: FunctionInput;
};

export type FunctionInvocationResponse = {
  type: FunctionType;
  output: FunctionOutput;
};
