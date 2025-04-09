import {
  twoFactorClient,
  usernameClient,
  anonymousClient,
  passkeyClient,
  adminClient,
  organizationClient,
} from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: "http://localhost:3000",
  plugins: [
    twoFactorClient(),
    usernameClient(),
    anonymousClient(),
    passkeyClient(),
    adminClient(),
    organizationClient(),
  ],
});

export type Session = typeof authClient.$Infer.Session;
