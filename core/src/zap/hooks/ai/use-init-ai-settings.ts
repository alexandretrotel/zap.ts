"use client";
import "client-only";

import { Effect } from "effect";
import { useEffect, useState } from "react";
import type { useForm } from "react-hook-form";

import { DEFAULT_MODEL } from "@/zap/data/ai";
import { orpc } from "@/zap/lib/orpc/client";
import type { AIFormValues, ModelName } from "@/zap/types/ai.types";

export function useInitAISettings(
  form: ReturnType<typeof useForm<AIFormValues>>,
  open: boolean,
) {
  const [loading, setLoading] = useState(false);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [model, setModel] = useState<ModelName | null>(null);

  const provider = form.watch("provider");

  useEffect(() => {
    if (!open || !provider) return;

    const fetchApiKey = async () => {
      setLoading(true);
      await Effect.runPromise(
        Effect.gen(function* (_) {
          const provider = form.getValues("provider");

          const result = yield* _(
            Effect.tryPromise({
              try: () => orpc.ai.getAISettings.call({ provider }),
              catch: () => undefined,
            }),
          );

          if (result) {
            setApiKey(result.apiKey);
            setModel(result.model);
          } else {
            setApiKey(null);
            setModel(DEFAULT_MODEL[provider]);
          }
        }).pipe(
          Effect.catchAll(() =>
            Effect.sync(() => {
              setApiKey(null);
              setModel(DEFAULT_MODEL[form.getValues("provider")]);
            }),
          ),
        ),
      );
      setLoading(false);
    };

    fetchApiKey();
  }, [form, open, provider]);

  return {
    apiKey,
    setApiKey,
    loading,
    setLoading,
    model,
    setModel,
  };
}
