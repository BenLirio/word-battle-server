import { zodResponseFormat } from "openai/helpers/zod";
import { FunctionContext } from "src/types";
import { z } from "zod";

const RacismDetectionResponse = z.object({
  isRacist: z.boolean(),
  reason: z.string().optional(),
});
export interface RacismDetectionResponseType {
  isRacist: boolean;
  reason?: string;
}

const racismDetectionPrompt = `You are an AI model tasked with detecting racist language in user inputs. Your specific task is to analyze individual user-generated words or phrases intended for insertion into prompts structured as: "Will {word1} beat {word2}". Your goal is to determine if a given word or phrase contains language indicative of racism.

Racist language in this scenario typically includes words or phrases that:

- Express prejudice, discrimination, or antagonism directed against people based on their race or ethnicity
- Contain racial slurs or derogatory terms targeting specific racial or ethnic groups
- Perpetuate harmful racial stereotypes or generalizations
- Suggest racial superiority or inferiority
- Promote racial discrimination or segregation
- Use coded language that implies racist concepts or ideas

Analyze the provided word or phrase carefully. If it contains racist content, return true and provide a reason for your conclusion explaining why the content is problematic. If it is not racist, return false with no reason.

Note that context matters, and some words may have different meanings in different contexts. Focus specifically on identifying language that promotes racial bias, discrimination, or hatred.
`;

export const detectRacism =
  ({ openai }: FunctionContext) =>
  async (word: string) => {
    const response = await openai.beta.chat.completions.parse({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: racismDetectionPrompt },
        {
          role: "user",
          content: `The text to analyze:\n"""\n${word}\n"""`,
        },
      ],
      response_format: zodResponseFormat(RacismDetectionResponse, "event"),
    });
    return response.choices[0].message.parsed! as RacismDetectionResponseType;
  };
