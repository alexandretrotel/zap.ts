"use client";
import "client-only";

import { PUBLIC_ENV } from "@/lib/env.public";
import { $fetch } from "@/lib/fetch";
import { handleClientError } from "@/zap/lib/api/client";
import { ClientError, EnvironmentError } from "@/zap/lib/api/errors";
import { useZapMutation } from "@/zap/lib/api/hooks/use-zap-mutation";
import { urlBase64ToUint8Array } from "@/zap/lib/pwa/utils";
import { usePushNotificationsStore } from "@/zap/stores/push-notifications.store";

interface SubscriptionResponse {
  success: boolean;
  subscriptionId: string;
}

interface UnsubscribeResponse {
  success: boolean;
}

interface ApiError {
  message: string;
}

export function usePushNotifications() {
  const subscription = usePushNotificationsStore((state) => state.subscription);
  const setSubscription = usePushNotificationsStore(
    (state) => state.setSubscription,
  );
  const setSubscribed = usePushNotificationsStore(
    (state) => state.setSubscribed,
  );
  const setSubscriptionState = usePushNotificationsStore(
    (state) => state.setSubscriptionState,
  );

  const { trigger: subscribeTrigger, isMutating: isSubscribing } =
    useZapMutation<
      SubscriptionResponse,
      ApiError,
      string,
      { subscription: PushSubscriptionJSON }
    >(
      "/api/user/notifications/subscribe",
      (url: string, { arg }: { arg: { subscription: PushSubscriptionJSON } }) =>
        $fetch<SubscriptionResponse>(url, {
          method: "POST",
          body: arg,
        }),
      {
        optimisticData: { subscriptionId: "temp-id" },
        rollbackOnError: true,
        populateCache: (result) => result,
        onError: async () => {
          if (subscription) {
            try {
              await subscription.unsubscribe();
            } finally {
              setSubscriptionState({
                subscription: null,
                isSubscribed: false,
              });
            }
          }
        },
        successMessage: "Subscribed to push notifications successfully!",
        skipErrorHandling: true, // Skip error handling to allow custom error handling in the component
      },
    );

  const { trigger: unsubscribeTrigger, isMutating: isUnsubscribing } =
    useZapMutation<UnsubscribeResponse, ApiError, string>(
      "/api/user/notifications/unsubscribe",
      (url: string) =>
        $fetch<UnsubscribeResponse>(url, {
          method: "DELETE",
        }),
      {
        rollbackOnError: false,
        populateCache: (result) => result,
        successMessage: "We will miss you!",
        skipErrorHandling: true, // Skip error handling to allow custom error handling in the component
      },
    );

  const subscribeToPush = async () => {
    setSubscribed(true);

    try {
      const registration = await navigator.serviceWorker.ready;

      if (!PUBLIC_ENV.NEXT_PUBLIC_VAPID_PUBLIC_KEY) {
        throw new EnvironmentError("VAPID public key is not set");
      }

      const applicationServerKey = urlBase64ToUint8Array(
        PUBLIC_ENV.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      );

      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey,
      });

      setSubscription(sub);

      const serializedSub = sub.toJSON();

      await subscribeTrigger({ subscription: serializedSub });
    } catch (error) {
      handleClientError(error);
    }
  };

  const unsubscribeFromPush = async () => {
    try {
      if (!subscription) {
        throw new ClientError("No active subscription found");
      }

      setSubscriptionState({
        subscription: null,
        isSubscribed: false,
      });

      await subscription.unsubscribe();
      await unsubscribeTrigger();
    } catch (error) {
      handleClientError(error, "Failed to unsubscribe from push notifications");
    }
  };

  return {
    subscribeToPush,
    unsubscribeFromPush,
    isSubscribing,
    isUnsubscribing,
  };
}
