import { writeFileSync } from "fs";
import { resolve } from "path";
import { generateBetterAuthSecret } from "./generate-better-auth-secret.js";

const coreEnv = [
  "BETTER_AUTH_SECRET",
  "BETTER_AUTH_URL",
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "SITE_URL",
  "DATABASE_URL",
  "RESEND_API_KEY",
  "NEXT_PUBLIC_VAPID_PUBLIC_KEY",
  "VAPID_PRIVATE_KEY",
  "POLAR_ACCESS_TOKEN",
  "POLAR_WEBHOOK_SECRET",
];

/**
 * Generates an `.env.local` file with required environment variables.
 *
 * This function collects core environment variables and additional variables
 * from the selected plugins. It then generates an `.env.local` file with placeholders
 * or appropriate values, such as:
 * - A securely generated `BETTER_AUTH_SECRET`
 * - A sample `DATABASE_URL`
 * - A default `BETTER_AUTH_URL`
 *
 * @param {string} outputDir - The output directory where the `.env.local` file will be written.
 * @param {PluginNames} selectedPlugins - An array of plugin names for which environment variables should be included.
 *
 * @returns {Promise<void>} A promise that resolves when the `.env.local` file is written.
 *
 * @example
 * ```ts
 * await generateExampleEnv(["pluginA", "pluginB"]);
 * // Generates an .env.local file with required env variables.
 * ```
 */
export const generateExampleEnv = async (outputDir: string): Promise<void> => {
  // Generate .env.local content
  const envContent = coreEnv
    .map((envVar) => {
      if (envVar === "BETTER_AUTH_SECRET") {
        const betterAuthSecret = generateBetterAuthSecret();
        return `${envVar}="${betterAuthSecret}"`;
      }

      if (envVar === "DATABASE_URL") {
        return `${envVar}="postgresql://fake_user:fake_password@ep-example-database.us-west-1.aws.neon.tech/fake_db?sslmode=require"`;
      }

      if (envVar === "BETTER_AUTH_URL") {
        return `${envVar}="http://localhost:3000"`;
      }

      return `${envVar}="your_${envVar.toLowerCase()}_here"`;
    })
    .join("\n");

  // Write .env file
  writeFileSync(resolve(outputDir, ".env"), envContent);
};
