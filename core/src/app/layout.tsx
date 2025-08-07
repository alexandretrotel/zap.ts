import "../zap/lib/orpc/server";
import "./globals.css";

import type { Metadata } from "next";

import { Toaster } from "@/components/ui/sonner";
import { geist } from "@/fonts";
import { VERCEL } from "@/lib/env.public";
import { ZAP_DEFAULT_METADATA, ZAP_DEFAULT_SETTINGS } from "@/zap.config";
import Providers from "@/zap/providers/providers";

export const metadata: Metadata = ZAP_DEFAULT_METADATA;

const VercelAnalytics = async () => {
  if (!(VERCEL && ZAP_DEFAULT_SETTINGS.ANALYTICS.ENABLE_VERCEL_ANALYTICS)) {
    return null;
  }

  const { Analytics } = await import("@vercel/analytics/react");
  return <Analytics />;
};

const VercelSpeedInsights = async () => {
  if (
    !(VERCEL && ZAP_DEFAULT_SETTINGS.ANALYTICS.ENABLE_VERCEL_SPEED_INSIGHTS)
  ) {
    return null;
  }

  const { SpeedInsights } = await import("@vercel/speed-insights/react");
  return <SpeedInsights />;
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geist.variable} antialiased`}>
        <Providers
          ENABLE_POSTHOG={ZAP_DEFAULT_SETTINGS.ANALYTICS.ENABLE_POSTHOG}
        >
          {children}

          <Toaster position="top-center" />
          <VercelAnalytics />
          <VercelSpeedInsights />
        </Providers>
      </body>
    </html>
  );
}
