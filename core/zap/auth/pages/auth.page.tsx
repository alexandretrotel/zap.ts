import Link from "next/link";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { isPluginEnabled } from "@/lib/plugins";
import { cn } from "@/lib/utils";
import { ZAP_LEGAL_CONFIG } from "@/zap/legal/zap.plugin.config";
import { SocialProviderButton } from "../components";
import { ZAP_AUTH_CONFIG } from "../zap.plugin.config";

interface AuthPageProps {
  title: string;
  description?: string;
  form: React.ReactNode;
  bottomText: {
    label: string;
    linkText: string;
    linkHref: string;
  };
}

const isLegalEnabled = isPluginEnabled("legal");

export function _AuthPage({
  title,
  description,
  form,
  bottomText,
}: AuthPageProps) {
  return (
    <div className="bg-muted/50 flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Link
          className="flex items-center gap-2 self-center font-medium"
          href="/"
        >
          Zap.ts ⚡️
        </Link>

        <div className="flex flex-col gap-6">
          <Card className="border shadow-none">
            <CardHeader className="text-center">
              <CardTitle className="text-xl">{title}</CardTitle>
              {ZAP_AUTH_CONFIG.ENABLE_SOCIAL_PROVIDER && description && (
                <CardDescription>{description}</CardDescription>
              )}
            </CardHeader>

            <CardContent>
              <div className="grid gap-6">
                {ZAP_AUTH_CONFIG.ENABLE_SOCIAL_PROVIDER && (
                  <>
                    <SocialProviders />
                    <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                      <span className="bg-card text-muted-foreground relative z-10 px-2">
                        Or continue with
                      </span>
                    </div>
                  </>
                )}

                {form}

                <div className="text-center text-sm">
                  {bottomText.label}{" "}
                  <Link
                    className="underline underline-offset-4"
                    href={bottomText.linkHref}
                  >
                    {bottomText.linkText}
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          {isLegalEnabled && <PolicyLinks />}
        </div>
      </div>
    </div>
  );
}

function SocialProviders() {
  const providers = ZAP_AUTH_CONFIG.PROVIDERS;
  return (
    <div className="flex flex-col gap-4">
      {providers.map((provider) => (
        <SocialProviderButton key={provider} provider={provider} />
      ))}
    </div>
  );
}

function PolicyLinks({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "text-muted-foreground [&_a]:hover:text-primary [&_a]:active:text-primary text-center text-xs text-balance [&_a]:underline [&_a]:underline-offset-4",
        className,
      )}
    >
      By clicking continue, you agree to our{" "}
      <Link href={ZAP_LEGAL_CONFIG.TERMS_OF_SERVICE_URL}>Terms of Service</Link>{" "}
      and <Link href={ZAP_LEGAL_CONFIG.PRIVACY_POLICY_URL}>Privacy Policy</Link>
      .
    </div>
  );
}
