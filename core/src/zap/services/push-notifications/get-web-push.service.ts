import "server-only";

import { SETTINGS } from "@/data/settings";
import { CLIENT_ENV } from "@/lib/env.client";
import { SERVER_ENV } from "@/lib/env.server";

let webpushInstance: typeof import("web-push") | null = null;

export async function getWebPushService() {
  if (webpushInstance) {
    return webpushInstance;
  }

  if (
    !(
      CLIENT_ENV.NEXT_PUBLIC_VAPID_PUBLIC_KEY &&
      SERVER_ENV.VAPID_PRIVATE_KEY &&
      SETTINGS.NOTIFICATIONS.VAPID_MAIL
    )
  ) {
    throw new Error(
      "VAPID configuration is incomplete. Push notifications are not available.",
    );
  }

  const webpush = await import("web-push");

  webpush.default.setVapidDetails(
    `mailto:${SETTINGS.NOTIFICATIONS.VAPID_MAIL}`,
    CLIENT_ENV.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    SERVER_ENV.VAPID_PRIVATE_KEY,
  );

  webpushInstance = webpush.default;
  return webpushInstance;
}
