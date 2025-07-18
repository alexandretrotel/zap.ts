import path from 'node:path';
import chalk from 'chalk';
import { Effect } from 'effect';
import fs from 'fs-extra';
import inquirer from 'inquirer';
import type { PackageManager } from '@/schemas/index.js';
import { PROJECT_NAME_REGEX } from '@/types/cli.js';

/**
 * Prompts the user for project name and validates the input.
 * @returns Effect that resolves to the project name
 */
export function promptProjectName(): Effect.Effect<string, Error, never> {
  return Effect.tryPromise({
    try: () =>
      inquirer.prompt([
        {
          type: 'input',
          name: 'projectName',
          message: chalk.yellow("What's the name of your project?"),
          default: 'my-zap-app',
          validate: (input: string) => {
            if (!PROJECT_NAME_REGEX.test(input)) {
              return 'Project name can only contain letters, numbers, hyphens, and underscores.';
            }
            if (fs.existsSync(path.join(process.cwd(), input))) {
              return `Directory '${input}' already exists. Please choose a different name.`;
            }
            return true;
          },
        },
      ]),
    catch: (e) => new Error(`Project name prompt failed: ${String(e)}`),
  }).pipe(Effect.map((response) => response.projectName));
}

/**
 * Prompts the user to select a package manager.
 * @returns Effect that resolves to the selected package manager
 */
export function promptPackageManagerSelection(): Effect.Effect<
  PackageManager,
  Error,
  never
> {
  return Effect.tryPromise({
    try: () =>
      inquirer.prompt([
        {
          type: 'list',
          name: 'packageManager',
          message: chalk.yellow('Which package manager do you want to use?'),
          choices: ['npm', 'yarn', 'pnpm', 'bun'],
        },
      ]),
    catch: (e) => new Error(`Package manager prompt failed: ${String(e)}`),
  }).pipe(Effect.map((response) => response.packageManager as PackageManager));
}
