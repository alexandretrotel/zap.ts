import "server-only";

import { streamText } from "ai";
import { Effect } from "effect";
import { z } from "zod";

import { SETTINGS } from "@/data/settings";
import { getModel } from "@/zap/lib/ai/get-model";
import { auth } from "@/zap/lib/auth/server";
import { orpcServer } from "@/zap/lib/orpc/server";
import { AIProviderIdSchema } from "@/zap/schemas/ai.schema";

export const maxDuration = 60;

const BodySchema = z.object({
  messages: z.any(),
  provider: AIProviderIdSchema,
});

export async function POST(req: Request) {
  const effect = Effect.gen(function* (_) {
    const session = yield* _(
      Effect.tryPromise({
        try: () => auth.api.getSession({ headers: req.headers }),
        catch: () => new Error("Unauthorized"),
      }),
    );

    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const unvalidatedBody = yield* _(
      Effect.tryPromise({
        try: () => req.json(),
        catch: () => new Error("Invalid JSON body"),
      }),
    );

    const body = BodySchema.parse(unvalidatedBody);
    const { provider } = body;

    const { apiKey, model } = yield* _(
      Effect.tryPromise({
        try: () =>
          orpcServer.ai.getAISettings({
            provider,
          }),
        catch: () => new Error("Failed to get AI settings"),
      }),
    );
    if (!apiKey) {
      return Response.json(
        { error: "API key is required for the selected provider" },
        { status: 400 },
      );
    }
    const result = streamText({
      model: getModel(provider, apiKey, model),
      messages: body.messages,
      system: SETTINGS.AI.SYSTEM_PROMPT,
      maxOutputTokens: SETTINGS.AI.CHAT?.MAX_OUTPUT_TOKENS,
      temperature: SETTINGS.AI.CHAT?.TEMPERATURE,
      presencePenalty: SETTINGS.AI.CHAT?.PRESENCE_PENALTY,
      frequencyPenalty: SETTINGS.AI.CHAT?.FREQUENCY_PENALTY,
      stopSequences: SETTINGS.AI.CHAT?.STOP_SEQUENCES,
      maxRetries: SETTINGS.AI.CHAT?.MAX_RETRIES,
    });

    return result.toUIMessageStreamResponse();
  }).pipe(
    Effect.catchAll((err) =>
      Effect.succeed(
        Response.json(
          { error: err.message || "Internal error" },
          { status: 500 },
        ),
      ),
    ),
  );

  return await Effect.runPromise(effect);
}
