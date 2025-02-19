import { Function, FunctionType, isRegisterUserInput } from "src/types";
import { registerUser } from "./registerUser";

export const functionMap: Record<FunctionType, Function> = {
  [FunctionType.RegisterUser]: registerUser,
};

export const inputValidationMap: Record<
  FunctionType,
  (input: unknown) => boolean
> = {
  [FunctionType.RegisterUser]: isRegisterUserInput,
};
