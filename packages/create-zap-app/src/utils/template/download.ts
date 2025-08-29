import path from 'node:path';
import fs from 'fs-extra';
import { FileSystemError } from '@/lib/errors';

export async function downloadTemplate(outputDir: string) {
  try {
    const tarballUrl =
      'https://api.github.com/repos/zap-studio/zap.ts/tarball/main';

    await fs.ensureDir(outputDir);

    const response = await fetch(tarballUrl);

    if (!response.ok) {
      throw new Error(
        `Failed to fetch template: ${response.status} ${response.statusText}`
      );
    }

    const buffer = await response.arrayBuffer();
    const tarballPath = path.join(outputDir, 'zap.ts.tar.gz');
    await fs.writeFile(tarballPath, Buffer.from(buffer));
    return tarballPath;
  } catch (error) {
    throw new FileSystemError(`Failed to download template: ${error}`);
  }
}
