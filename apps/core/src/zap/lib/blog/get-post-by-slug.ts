import fs from "fs/promises";
import path from "path";
import matter from "gray-matter";
import {
  BlogFrontmatterSchema,
  BlogFrontmatter,
} from "@/zap/schemas/blog.schema";

const BLOG_DIR = path.join(process.cwd(), "src/data/blog");

export async function getPostBySlug(
  slug: string,
): Promise<{ frontmatter: BlogFrontmatter; content: string } | null> {
  const filePath = path.join(BLOG_DIR, `${slug}.mdx`);

  try {
    const source = await fs.readFile(filePath, "utf8");
    const { data, content } = matter(source);
    const parsed = BlogFrontmatterSchema.safeParse({ ...data, slug });
    if (!parsed.success || !parsed.data.published) return null;
    return { frontmatter: parsed.data, content };
  } catch {
    return null;
  }
}
