import { z } from 'zod';

export const PackageManagerSchema = z.union([
  z.literal('npm'),
  z.literal('yarn'),
  z.literal('pnpm'),
  z.literal('bun'),
]);

export type PackageManager = z.infer<typeof PackageManagerSchema>;
