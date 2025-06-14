"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Effect } from "effect";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Control, useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  AI_PROVIDERS_OBJECT,
  DEFAULT_MODEL,
  ModelsByProvider,
} from "@/zap/data/ai";
import { useAISettings } from "@/zap/hooks/features/ai/use-ai-settings";
import { useInitAISettings } from "@/zap/hooks/features/ai/use-init-ai-settings";
import { orpc } from "@/zap/lib/orpc/client";
import { AIFormSchema, AIProviderIdSchema } from "@/zap/schemas/ai.schema";
import { AIFormValues, AIProviderId } from "@/zap/types/ai.types";

interface AISettingsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AISettingsSheet({ open, onOpenChange }: AISettingsSheetProps) {
  const [testing, setTesting] = useState(false);
  const [initialApiKey, setInitialApiKey] = useState<string | null>(null);

  const { isSaving, setIsValidated, saveApiKey } = useAISettings();

  const form = useForm<AIFormValues>({
    resolver: zodResolver(AIFormSchema),
    defaultValues: {
      provider: AIProviderIdSchema.options[0],
      model: ModelsByProvider[AIProviderIdSchema.options[0]][0],
      apiKey: "",
    },
  });

  const selectedProvider = form.watch("provider");

  const { loading, apiKey, model: savedModel } = useInitAISettings(form, open);

  useEffect(() => {
    if (apiKey) {
      setInitialApiKey(apiKey);
      form.setValue("apiKey", apiKey, { shouldValidate: true });
    } else {
      form.resetField("apiKey");
    }
  }, [apiKey, form, selectedProvider]);

  useEffect(() => {
    if (selectedProvider && savedModel) {
      form.setValue("model", savedModel, {
        shouldValidate: true,
      });
    } else {
      form.setValue("model", DEFAULT_MODEL[selectedProvider], {
        shouldValidate: true,
      });
    }
  }, [form, savedModel, selectedProvider]);

  const handleSubmit = async (values: AIFormValues) => {
    await saveApiKey(values);
    onOpenChange(false);
  };

  async function handleTestApiKey() {
    setTesting(true);
    await Effect.tryPromise({
      try: () =>
        orpc.ai.testAPIKey.call({
          provider: form.getValues("provider"),
          apiKey: form.getValues("apiKey"),
          model: form.getValues("model"),
        }),
      catch: () => ({ error: true }),
    })
      .pipe(
        Effect.match({
          onSuccess: () => {
            toast.success("API key is valid!");
            setIsValidated(true);
          },
          onFailure: () => {
            toast.error("Invalid API key");
            setIsValidated(false);
          },
        }),
      )
      .pipe(Effect.runPromise)
      .catch(() => {
        toast.error("An error occurred while testing the API key");
      });
    setTesting(false);
  }

  const isSaveDisabled =
    isSaving || testing || form.getValues("apiKey") === initialApiKey; // Key unchanged

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md">
        <SheetHeader className="space-y-2">
          <SheetTitle>AI Settings</SheetTitle>
          <SheetDescription>
            Configure your AI provider and API key securely.
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6 px-4"
          >
            <ProviderSelect control={form.control} disabled={isSaving} />
            <ModelSelect
              control={form.control}
              disabled={isSaving}
              provider={selectedProvider}
            />
            <ApiKeyInput
              control={form.control}
              disabled={isSaving || loading}
              loading={loading}
              testing={testing}
              handleTestApiKey={handleTestApiKey}
            />
            <ActionButtons
              isSaving={isSaving}
              isSaveDisabled={isSaveDisabled}
            />
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}

interface FormFieldProps {
  control: Control<AIFormValues>;
  disabled: boolean;
}

function ProviderSelect({ control, disabled }: FormFieldProps) {
  return (
    <FormField
      control={control}
      name="provider"
      render={({ field }) => (
        <FormItem>
          <FormLabel>AI Provider</FormLabel>
          <Select
            onValueChange={field.onChange}
            value={field.value}
            disabled={disabled}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select a provider" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {AIProviderIdSchema.options.map((provider) => (
                <SelectItem key={provider} value={provider}>
                  {
                    AI_PROVIDERS_OBJECT.find((p) => p.provider === provider)
                      ?.name
                  }
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

function ApiKeyInput({
  control,
  disabled,
  loading,
  testing,
  handleTestApiKey,
}: FormFieldProps & {
  loading: boolean;
  testing: boolean;
  handleTestApiKey: () => void;
}) {
  const [showKey, setShowKey] = useState(false);

  return (
    <FormField
      control={control}
      name="apiKey"
      render={({ field }) => (
        <div className="flex items-end space-x-2">
          <FormItem className="flex-1">
            <FormLabel>API Key</FormLabel>
            <FormControl className="relative flex-1">
              <div className="relative">
                <Input
                  type={showKey ? "text" : "password"}
                  placeholder={loading ? "Loading..." : "Enter your API key"}
                  {...field}
                  disabled={disabled}
                  className="pr-10 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowKey((prev) => !prev)}
                  className="text-muted-foreground hover:text-foreground absolute top-1/2 right-2 -translate-y-1/2"
                  tabIndex={-1}
                >
                  {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
          <Button
            type="button"
            variant="outline"
            onClick={handleTestApiKey}
            disabled={disabled || !field.value || testing}
          >
            {testing ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Testing...
              </>
            ) : (
              "Test API Key"
            )}
          </Button>
        </div>
      )}
    />
  );
}

function ActionButtons({
  isSaving,
  isSaveDisabled,
}: {
  isSaving: boolean;
  isSaveDisabled: boolean;
}) {
  return (
    <div className="flex justify-end">
      <Button
        type="submit"
        className="w-full sm:w-auto"
        disabled={isSaving || isSaveDisabled}
      >
        {isSaving ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : (
          "Save Settings"
        )}
      </Button>
    </div>
  );
}

interface ModelSelectProps {
  control: Control<AIFormValues>;
  disabled: boolean;
  provider: AIProviderId;
}

function ModelSelect({ control, disabled, provider }: ModelSelectProps) {
  const models = ModelsByProvider[provider];

  return (
    <FormField
      control={control}
      name="model"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Model</FormLabel>
          <Select
            onValueChange={field.onChange}
            value={field.value}
            disabled={disabled}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select a model" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {models.map((model) => (
                <SelectItem key={model} value={model}>
                  {model}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
