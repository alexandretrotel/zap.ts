import "server-only";

import { eq } from "drizzle-orm";
import { Effect } from "effect";
import { NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/db";
import { getPushNotificationsByUserQuery } from "@/zap/db/queries/push-notifications.query";
import { pushNotifications } from "@/zap/db/schema/notifications.sql";
import { auth } from "@/zap/lib/auth/server";

const subscribeSchema = z.object({
  subscription: z.object({
    endpoint: z.url(),
    keys: z.object({
      p256dh: z.string(),
      auth: z.string(),
    }),
  }),
});

export async function POST(req: Request) {
  const effect = Effect.gen(function* (_) {
    const session = yield* _(
      Effect.tryPromise({
        try: () => auth.api.getSession({ headers: req.headers }),
        catch: () => null,
      }),
    );

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    const body = yield* _(
      Effect.tryPromise({
        try: () => req.json(),
        catch: () => new Error("Invalid JSON body"),
      }),
    );

    const subscriptionResult = yield* _(
      Effect.try({
        try: () => subscribeSchema.parse(body).subscription,
        catch: () => new Error("Invalid subscription data"),
      }).pipe(Effect.either),
    );

    if (subscriptionResult._tag === "Left") {
      return NextResponse.json(
        { message: "Invalid subscription data" },
        { status: 400 },
      );
    }

    const subscription = subscriptionResult.right;

    const existingSubscription = yield* _(
      Effect.tryPromise({
        try: () => getPushNotificationsByUserQuery.execute({ userId }),
        catch: () => null,
      }),
    );

    if (existingSubscription) {
      yield* _(
        Effect.tryPromise({
          try: () =>
            db
              .update(pushNotifications)
              .set({ subscription })
              .where(eq(pushNotifications.userId, userId))
              .execute(),
          catch: () => null,
        }),
      );

      return NextResponse.json({
        success: true,
        subscriptionId: existingSubscription.id,
      });
    }

    const newSubscriptionArr = yield* _(
      Effect.tryPromise({
        try: () =>
          db
            .insert(pushNotifications)
            .values({
              userId,
              subscription,
            })
            .returning()
            .execute(),
        catch: () => [],
      }),
    );

    const newSubscription = newSubscriptionArr[0];

    return NextResponse.json({
      success: true,
      subscriptionId: newSubscription?.id,
    });
  }).pipe(
    Effect.catchAll((err) =>
      Effect.succeed(
        NextResponse.json(
          {
            message:
              err instanceof z.ZodError
                ? "Invalid subscription data"
                : "Internal server error",
          },
          { status: err instanceof z.ZodError ? 400 : 500 },
        ),
      ),
    ),
  );

  return await Effect.runPromise(effect);
}
