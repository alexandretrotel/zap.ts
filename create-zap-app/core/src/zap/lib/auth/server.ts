import { betterAuth } from "better-auth";
import {
  twoFactor,
  username,
  anonymous,
  admin,
  organization,
} from "better-auth/plugins";
import { SETTINGS } from "@/data/settings";
import { passkey } from "better-auth/plugins/passkey";
import { FLAGS } from "@/data/flags";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/db";
import {
  sendForgotPasswordMail,
  sendVerificationEmail,
} from "@/zap/actions/emails.action";
import { canSendEmail, updateLastEmailSent } from "@/zap/lib/rate-limit";

const MAIL_PREFIX = "Zap.ts"; // ZAP:TODO: Change this to your app name

export const auth = betterAuth({
  appName: "Zap.ts",
  database: drizzleAdapter(db, { provider: "pg" }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: SETTINGS.MINIMUM_PASSWORD_LENGTH,
    maxPasswordLength: SETTINGS.MAXIMUM_PASSWORD_LENGTH,
    requireEmailVerification: FLAGS.REQUIRE_EMAIL_VERIFICATION,
    sendResetPassword: async ({ user, url }) => {
      const { canSend, timeLeft } = await canSendEmail(user.id);
      if (!canSend) {
        throw new Error(
          `Please wait ${timeLeft} seconds before requesting another password reset email.`,
        );
      }

      await sendForgotPasswordMail({
        recipients: [user.email],
        subject: `${MAIL_PREFIX} - Reset your password`,
        url,
      });

      await updateLastEmailSent(user.id);
    },
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      const { canSend, timeLeft } = await canSendEmail(user.id);
      if (!canSend) {
        throw new Error(
          `Please wait ${timeLeft} seconds before requesting another password reset email.`,
        );
      }

      await sendVerificationEmail({
        recipients: [user.email],
        subject: `${MAIL_PREFIX} - Verify your email`,
        url,
      });

      await updateLastEmailSent(user.id);
    },
  },
  socialProviders: {
    google: {
      enabled: true,
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  plugins: [
    twoFactor(),
    username({
      minUsernameLength: SETTINGS.MINIMUM_USERNAME_LENGTH,
      maxUsernameLength: SETTINGS.MAXIMUM_USERNAME_LENGTH,
      usernameValidator: (username) => username !== "admin",
    }),
    anonymous(),
    passkey(),
    admin(),
    organization(),
  ],
});
