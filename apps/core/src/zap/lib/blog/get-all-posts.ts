import fs from "fs/promises";
import path from "path";
import matter from "gray-matter";
import {
  BlogFrontmatterSchema,
  BlogFrontmatter,
} from "@/zap/schemas/blog.schema";

const BLOG_DIR = path.join(process.cwd(), "src/data/blog");

export async function getAllPosts(): Promise<
  Array<BlogFrontmatter & { slug: string }>
> {
  const files = await fs.readdir(BLOG_DIR);
  const posts: Array<BlogFrontmatter & { slug: string }> = [];

  for (const file of files) {
    if (!file.endsWith(".mdx")) continue;
    const filePath = path.join(BLOG_DIR, file);
    const source = await fs.readFile(filePath, "utf8");
    const { data } = matter(source);
    const parsed = BlogFrontmatterSchema.safeParse({
      ...data,
      slug: data.slug || file.replace(/\.mdx$/, ""),
    });
    if (parsed.success && parsed.data.published) {
      posts.push({ ...parsed.data, slug: parsed.data.slug });
    }
  }

  posts.sort((a, b) => (a.date < b.date ? 1 : -1));
  return posts;
}
