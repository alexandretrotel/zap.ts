"use client";

import { useRouter } from "@bprogress/next/app";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ZapButton } from "@/components/zap-ui/button";
import { handleClientError } from "@/zap/lib/api/client";
import { AuthenticationError } from "@/zap/lib/api/errors";
import { authClient } from "@/zap/lib/auth/client";

const formSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z
      .string()
      .min(8, "Password must be at least 8 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type FormSchema = z.infer<typeof formSchema>;

export function ResetPasswordForm() {
  const [submitting, setSubmitting] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  const router = useRouter();

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    const _token = new URLSearchParams(window.location.search).get("token");
    setToken(_token);
  }, []);

  const onSubmit = async (values: FormSchema) => {
    setSubmitting(true);
    const { password } = values;

    if (!token) {
      setSubmitting(false);
      throw new AuthenticationError("Invalid token. Please try again.");
    }

    try {
      await authClient.resetPassword({
        newPassword: password,
        token,
      });

      toast.success("Password reset successfully!");
      form.reset();
      router.push("/login");
    } catch (error) {
      handleClientError(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>New Password</FormLabel>
              <FormControl>
                <Input
                  placeholder="••••••••"
                  type="password"
                  {...field}
                  disabled={submitting}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm Password</FormLabel>
              <FormControl>
                <Input
                  placeholder="••••••••"
                  type="password"
                  {...field}
                  disabled={submitting}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <ZapButton
          className="w-full"
          loading={submitting}
          loadingText="Resetting..."
          type="submit"
        >
          Reset Password
        </ZapButton>
      </form>
    </Form>
  );
}
