import type { Ora } from 'ora';
import { ProcessExitError, PromptError } from '@/lib/errors';
import type { PackageManager } from '@/schemas/package-manager.schema';
import { execAsync } from '@/utils';
import { promptPackageManagerSelection } from './prompts';

export function getInstallCommand(pm: PackageManager) {
  switch (pm) {
    case 'npm':
      return 'npm install --legacy-peer-deps';
    case 'yarn':
      return 'yarn';
    case 'pnpm':
      return 'pnpm install';
    case 'bun':
      return 'bun install';
    default:
      return 'npm install --legacy-peer-deps';
  }
}

export function installDependenciesWithRetry(
  initialPM: PackageManager,
  outputDir: string,
  spinner: Ora
) {
  const maxRetries = 3;
  let currentPM: PackageManager = initialPM;

  const attemptInstall = async (retryCount: number) => {
    spinner.text = `Installing dependencies with ${currentPM}...`;
    spinner.start();

    const installCmd = getInstallCommand(currentPM);

    try {
      await execAsync(installCmd, { cwd: outputDir });
      spinner.succeed(`Dependencies installed with ${currentPM}.`);
      return currentPM;
    } catch {
      spinner.fail(`Failed to install dependencies with ${currentPM}.`);

      if (retryCount >= maxRetries) {
        throw new ProcessExitError(
          `Failed to install dependencies after ${maxRetries} attempts. Please try installing manually.`
        );
      }

      try {
        currentPM = await promptPackageManagerSelection(
          `${currentPM} failed. Which package manager would you like to try?`
        );
        return attemptInstall(retryCount + 1);
      } catch (error) {
        throw new PromptError(
          `Failed to get package manager selection: ${error}`
        );
      }
    }
  };

  return attemptInstall(0);
}

export async function updateDependencies(
  packageManager: PackageManager,
  outputDir: string,
  spinner: Ora
) {
  try {
    spinner.text = 'Updating dependencies...';
    spinner.start();

    await execAsync(`${packageManager} update`, { cwd: outputDir });
    spinner.succeed('Dependencies updated successfully.');
  } catch {
    spinner.warn('Failed to update dependencies, continuing anyway...');
  }
}
