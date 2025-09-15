import "server-only";

import { HttpStatus } from "@/zap/errors";
import { DEFAULT_CONFIG } from "@/zap/plugins/config/default";
import type { AuthServerPluginConfig } from "@/zap/plugins/types/auth.plugin";

export function redirectToLogin(pluginConfig: Partial<AuthServerPluginConfig>) {
  return Response.redirect(
    pluginConfig?.LOGIN_URL ?? DEFAULT_CONFIG.auth.LOGIN_URL,
    HttpStatus.TEMPORARY_REDIRECT
  );
}
