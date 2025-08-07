import "server-only";

import { DEV } from "@/lib/env.public";
import {
  generateCorrelationId,
  getAuthenticatedSession,
  handleError,
  type HandlerFunction,
  type HandlerOptions,
  logSuccess,
} from "@/zap/lib/api/utils";

function createHandler<T extends unknown[], R>(
  handler: HandlerFunction<T, R>,
  options: HandlerOptions & { handlerType: string },
) {
  return async (...args: T): Promise<R> => {
    const correlationId = options.correlationId || generateCorrelationId();
    const startTime = Date.now();

    try {
      const result = await handler(...args);

      if (DEV) {
        logSuccess(correlationId, startTime, options);
      }

      return result;
    } catch (error) {
      return handleError(error, correlationId, startTime, options);
    }
  };
}

export function withApiHandler<T extends unknown[], R>(
  handler: HandlerFunction<T, R>,
  options: HandlerOptions = {},
) {
  return createHandler(handler, {
    ...options,
    handlerType: "api-route",
  });
}

export function withAuthenticatedApiHandler<T extends unknown[], R>(
  handler: HandlerFunction<T, R>,
  options: HandlerOptions = {},
) {
  return createHandler(
    async (...args: T): Promise<R> => {
      const request = args[0] as Request;
      await getAuthenticatedSession(request);

      return handler(...args);
    },
    {
      ...options,
      handlerType: "authenticated-api-route",
    },
  );
}

export function withRpcHandler<T extends unknown[], R>(
  handler: HandlerFunction<T, R>,
  options: HandlerOptions = {},
) {
  return createHandler(handler, {
    ...options,
    handlerType: "rpc-procedure",
    context: { type: "rpc", ...options.context },
  });
}

export function withServerActionHandler<T extends unknown[], R>(
  handler: HandlerFunction<T, R>,
  options: HandlerOptions = {},
) {
  return createHandler(handler, {
    ...options,
    handlerType: "server-action",
    context: { type: "server-action", ...options.context },
  });
}
