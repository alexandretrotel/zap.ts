"use client";

import { useORPC } from "@/stores/orpc.store";
import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import { toast } from "sonner";
import { FeedbackFormValues } from "@/schemas/feedback.schema";
import React, { useEffect, useState } from "react";

export const useUserFeedback = () => {
  const orpc = useORPC();

  return useSWR(
    orpc.feedback.getUserFeedback.key,
    orpc.feedback.getUserFeedback.queryOptions().queryFn,
  );
};

export const useIsFeedbackSubmitted = () => {
  const [isExistingFeedback, setIsExistingFeedback] = useState(false);

  const { data: existingFeedback } = useUserFeedback();

  useEffect(() => {
    if (existingFeedback) {
      setIsExistingFeedback(true);
    } else {
      setIsExistingFeedback(false);
    }
  }, [existingFeedback]);

  return { isExistingFeedback, setIsExistingFeedback };
};

export const useSubmitFeedback = (
  setIsExistingFeedback: React.Dispatch<React.SetStateAction<boolean>>,
) => {
  const orpc = useORPC();

  interface GiveFeedbackArgs {
    key: readonly unknown[];
    arg: { arg: FeedbackFormValues };
  }

  const giveFeedback = (
    key: GiveFeedbackArgs["key"],
    { arg }: GiveFeedbackArgs["arg"],
  ) => {
    return orpc.feedback.submit.call(arg);
  };

  return useSWRMutation(orpc.feedback.submit.key, giveFeedback, {
    optimisticData: (current) => ({ ...current, success: true }),
    rollbackOnError: true,
    revalidate: true,
    onSuccess: () => {
      setIsExistingFeedback(true);
      toast.success("Thank you for your feedback!");
    },
    onError: () => {
      setIsExistingFeedback(false);
      toast.error("Failed to submit feedback. Please try again.");
    },
  });
};
