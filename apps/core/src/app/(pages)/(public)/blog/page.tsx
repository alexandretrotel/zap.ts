import { getAllPosts } from "@/zap/lib/blog/get-all-posts";
import { BlogList } from "@/zap/components/blog/BlogList";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog | Zap.ts",
  description: "Read the latest posts from the Zap.ts blog.",
};

export default async function BlogPage() {
  const posts = await getAllPosts();
  return (
    <main className="container py-8">
      <h1 className="mb-6 text-3xl font-bold">Blog</h1>
      <BlogList posts={posts} />
    </main>
  );
}
