import { z } from "zod";

export const BlogFrontmatterSchema = z.object({
  title: z.string(),
  slug: z.string(),
  date: z.string(),
  excerpt: z.string(),
  image: z.string().optional(),
  tags: z.array(z.string()).optional(),
  published: z.boolean().default(false),
});

export type BlogFrontmatter = z.infer<typeof BlogFrontmatterSchema>;
