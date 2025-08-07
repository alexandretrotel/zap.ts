import "server-only";

import { streamText } from "ai";

import { SETTINGS } from "@/data/settings";
import { getModel } from "@/zap/lib/ai/get-model";
import { BadRequestError } from "@/zap/lib/api/errors";
import { orpcServer } from "@/zap/lib/orpc/server";
import type { AIProviderId } from "@/zap/types/ai.types";

interface StreamCompletionInput {
  provider: AIProviderId;
  prompt: string;
}

export interface StreamCompletionProps {
  input: StreamCompletionInput;
}

export async function streamCompletionService({
  input,
}: StreamCompletionProps) {
  const { provider, prompt } = input;

  const aiSettings = await orpcServer.ai.getAISettings({ provider });

  if (!aiSettings) {
    throw new BadRequestError(
      "AI settings not configured for the selected provider",
    );
  }

  const { apiKey, model } = aiSettings;

  return streamText({
    model: getModel(provider, apiKey, model),
    prompt,
    system: SETTINGS.AI.SYSTEM_PROMPT,
    maxOutputTokens: SETTINGS.AI.COMPLETION?.MAX_OUTPUT_TOKENS,
    temperature: SETTINGS.AI.COMPLETION?.TEMPERATURE,
    presencePenalty: SETTINGS.AI.COMPLETION?.PRESENCE_PENALTY,
    frequencyPenalty: SETTINGS.AI.COMPLETION?.FREQUENCY_PENALTY,
    stopSequences: SETTINGS.AI.COMPLETION?.STOP_SEQUENCES,
    maxRetries: SETTINGS.AI.COMPLETION?.MAX_RETRIES,
  });
}
