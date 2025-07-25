import path, { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import chalk from 'chalk';
import { Effect, pipe } from 'effect';
import figlet from 'figlet';
import fs from 'fs-extra';

export function getPackageVersion() {
  const program = Effect.gen(function* () {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);

    const packageJsonPath = yield* Effect.try(() =>
      path.join(__dirname, '..', 'package.json')
    );
    const content = yield* Effect.tryPromise(() =>
      fs.readFile(packageJsonPath, 'utf8')
    );

    const pkg = JSON.parse(content);
    return pkg.version;
  });

  const recovered = pipe(
    program,
    Effect.catchAll((error) => {
      process.stderr.write(`Failed to read package version: ${error}`);
      return Effect.succeed(undefined);
    })
  );

  return recovered;
}

export function displayWelcome() {
  const banner = figlet.textSync('Zap.ts', {
    font: 'ANSI Shadow',
  });

  process.stdout.write('\x1B[2J\x1B[0f\n');
  process.stdout.write(
    chalk.bold.cyan(banner) +
      chalk.bold.cyan(
        "\n🚀 Welcome to create-zap-app! Let's build something awesome.\n"
      )
  );
}

export const displayNextSteps = (filename: string) => {
  process.stdout.write(`\n${chalk.blue('📋 Next steps:')}`);
  process.stdout.write(
    `\n1. Review and customize the variables in ${chalk.cyan(filename)}`
  );
  process.stdout.write(
    `\n2. Copy ${chalk.cyan(filename)} to ${chalk.cyan('.env')} or ${chalk.cyan('.env.local')}`
  );
  process.stdout.write('\n3. Fill in the actual values for your environment');
  process.stdout.write(
    '\n4. Add your environment file to .gitignore if it contains sensitive data'
  );

  process.stdout.write(`\n\n${chalk.yellow('⚠️  Important:')}`);
  process.stdout.write(
    '\n• Required variables are uncommented and must be set'
  );
  process.stdout.write(
    '\n• Optional variables are commented out with # prefix'
  );
  process.stdout.write(
    '\n• Never commit files containing real secrets to version control\n'
  );
};
