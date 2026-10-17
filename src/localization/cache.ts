import { FunctionContext } from "src/types";

// Stores one translation inside a map attribute on an existing item. The map
// is created first because DynamoDB cannot set a nested path on a missing map.
export const saveTranslation =
  ({ ddb }: FunctionContext) =>
  async ({
    TableName,
    Key,
    mapAttribute,
    language,
    translation,
    extraAttributes = {},
  }: {
    TableName: string;
    Key: Record<string, string | number>;
    mapAttribute: string;
    language: string;
    translation: string;
    extraAttributes?: Record<string, string>;
  }) => {
    const extraNames = Object.keys(extraAttributes);
    await ddb
      .update({
        TableName,
        Key,
        ConditionExpression: "attribute_exists(hashKey)",
        UpdateExpression: `SET ${[
          "#map = if_not_exists(#map, :empty)",
          ...extraNames.map(
            (_, i) => `#extra${i} = if_not_exists(#extra${i}, :extra${i})`,
          ),
        ].join(", ")}`,
        ExpressionAttributeNames: {
          "#map": mapAttribute,
          ...Object.fromEntries(
            extraNames.map((name, i) => [`#extra${i}`, name]),
          ),
        },
        ExpressionAttributeValues: {
          ":empty": {},
          ...Object.fromEntries(
            extraNames.map((name, i) => [`:extra${i}`, extraAttributes[name]]),
          ),
        },
      })
      .promise();
    await ddb
      .update({
        TableName,
        Key,
        ConditionExpression: "attribute_exists(hashKey)",
        UpdateExpression: "SET #map.#language = :translation",
        ExpressionAttributeNames: {
          "#map": mapAttribute,
          "#language": language,
        },
        ExpressionAttributeValues: { ":translation": translation },
      })
      .promise();
  };
