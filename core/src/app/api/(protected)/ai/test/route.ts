import "server-only";

import { generateText } from "ai";
import { Effect } from "effect";
import { z } from "zod";

import { getModel } from "@/zap/lib/ai/get-model";
import { auth } from "@/zap/lib/auth/server";
import { AIProviderIdSchema, ModelNameSchema } from "@/zap/schemas/ai.schema";

export const maxDuration = 60;

const BodySchema = z.object({
  provider: AIProviderIdSchema,
  apiKey: z.string(),
  model: ModelNameSchema,
});

export async function POST(req: Request) {
  const effect = Effect.gen(function* (_) {
    const session = yield* _(
      Effect.tryPromise({
        try: () => auth.api.getSession({ headers: req.headers }),
        catch: () => null,
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
    const { provider, apiKey, model } = body;

    yield* _(
      Effect.tryPromise({
        try: () =>
          generateText({
            model: getModel(provider, apiKey, model),
            prompt: "This is just a test, answer with 1 token.",
            maxOutputTokens: 16,
          }),
        catch: () => new Error("Invalid API key"),
      }),
    );

    return Response.json({ success: true }, { status: 200 });
  }).pipe(
    Effect.catchAll((err) =>
      Effect.succeed(
        Response.json(
          { error: err?.message ? err.message : "Internal error" },
          { status: 401 },
        ),
      ),
    ),
  );

  return await Effect.runPromise(effect);
}
