"use client";

import { useState } from "react";
import { toast } from "sonner";

import { ZapButton } from "@/components/zap-ui/button";
import { AUTH_ICONS } from "@/data/auth-icons";
import { type Provider, ZAP_DEFAULT_SETTINGS } from "@/zap.config";
import { authClient } from "@/zap/lib/auth/client";

interface SocialProviderButtonProps {
  provider: Provider;
}

export function SocialProviderButton({ provider }: SocialProviderButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleSocialLogin = async (provider: Provider) => {
    setLoading(true);

    try {
      const { data, error } = await authClient.signIn.social({
        provider,
        callbackURL: ZAP_DEFAULT_SETTINGS.AUTH.REDIRECT_URL_AFTER_SIGN_IN,
      });

      if (error) {
        toast.error("Login failed. Please try again.");
      }

      if (data) {
        toast.success("Login successful!");
      } else {
        toast.error("Login failed. Please try again.");
      }
    } catch {
      toast.error("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ZapButton
      className="w-full gap-2"
      loading={loading}
      loadingText="Logging in..."
      onClick={() => handleSocialLogin(provider)}
      variant="outline"
    >
      {AUTH_ICONS[provider]}
      {`Login with ${provider.charAt(0).toUpperCase() + provider.slice(1)}`}
    </ZapButton>
  );
}
