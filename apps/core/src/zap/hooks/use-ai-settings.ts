"use client";

import { useState } from "react";
import { toast } from "sonner";
import { orpc } from "../lib/orpc/client";
import { AIFormValues } from "../schemas/ai.schema";
import { useAIProviderStore } from "../stores/ai.store";

export const useAISettings = () => {
  const [isSaving, setIsSaving] = useState(false);
  const [isValidated, setIsValidated] = useState(false);
  const [initialKey, setInitialKey] = useState<string | null>(null);

  const { setModel, setProvider } = useAIProviderStore();

  const saveApiKey = async (values: AIFormValues) => {
    setIsSaving(true);
    console.log("Saving API key", values);
    if (!values.model) {
      toast.error("Please select a model");
      return;
    }

    try {
      if (!values.apiKey) {
        // Delete API key when saving empty
        setProvider(values.provider);
        setModel(values.provider, values.model);
        await orpc.ai.deleteAPIKey.call({ provider: values.provider });
        toast.success("API key deleted successfully");
        setIsValidated(false);
        setInitialKey(null);
      } else {
        setProvider(values.provider);
        setModel(values.provider, values.model);
        await orpc.ai.saveOrUpdateAPIKey.call(values);
        toast.success("API key saved successfully");
        setInitialKey(values.apiKey);
      }
    } catch {
      toast.error(
        values.apiKey ? "Failed to save API key" : "Failed to delete API key",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return {
    isSaving,
    isValidated,
    setIsValidated,
    initialKey,
    setInitialKey,
    saveApiKey,
  };
};
