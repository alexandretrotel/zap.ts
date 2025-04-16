import { SETTINGS } from "@/data/settings";
import { getAISettings } from "@/zap/actions/ai.action";
import { getModel } from "@/zap/lib/ai";
import { auth } from "@/zap/lib/auth/server";
import { AIProviderIdSchema } from "@/zap/schemas/ai.schema";
import { streamText } from "ai";
import { z } from "zod";

export const maxDuration = 60;

const BodySchema = z.object({
  prompt: z.string(),
  provider: AIProviderIdSchema,
});

export async function POST(req: Request) {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const unvalidatedBody = await req.json();
  const body = BodySchema.parse(unvalidatedBody);
  const { provider } = body;
  const { apiKey, model } = await getAISettings(session.user.id, body.provider);

  const result = streamText({
    model: getModel(provider, apiKey, model),
    prompt: body.prompt,
    system: SETTINGS.AI.SYSTEM_PROMPT,
    maxTokens: SETTINGS.AI.COMPLETION?.MAX_TOKENS,
    temperature: SETTINGS.AI.COMPLETION?.TEMPERATURE,
    presencePenalty: SETTINGS.AI.COMPLETION?.PRESENCE_PENALTY,
    frequencyPenalty: SETTINGS.AI.COMPLETION?.FREQUENCY_PENALTY,
    stopSequences: SETTINGS.AI.COMPLETION?.STOP_SEQUENCES,
    maxRetries: SETTINGS.AI.COMPLETION?.MAX_RETRIES,
  });

  return result.toDataStreamResponse();
}
