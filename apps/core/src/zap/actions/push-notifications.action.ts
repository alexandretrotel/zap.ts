"use server";

import { db } from "@/db";
import { pushNotifications } from "@/db/schema";
import { eq } from "drizzle-orm";
import webpush from "web-push";
import { getUserId } from "@/zap/actions/authenticated.action";
import { SubscribeUserSchema } from "@/zap/schemas/push-notifications.schema";
import { SETTINGS } from "@/data/settings";

webpush.setVapidDetails(
  `mailto:${SETTINGS.NOTIFICATIONS.VAPID_MAIL}`,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!,
);

export async function subscribeUser(sub: PushSubscription) {
  const validatedParams = SubscribeUserSchema.parse({
    subscription: sub,
  });

  try {
    const userId = await getUserId();

    await db.insert(pushNotifications).values({
      subscription: validatedParams.subscription,
      userId,
    });
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error };
  }
}

export async function unsubscribeUser() {
  try {
    const userId = await getUserId();

    await db
      .delete(pushNotifications)
      .where(eq(pushNotifications.userId, userId));
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, error };
  }
}
