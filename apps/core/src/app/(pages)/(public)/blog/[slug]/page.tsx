import { notFound } from "next/navigation";
import { getPostBySlug } from "@/zap/lib/blog/get-post-by-slug";
import { BlogPost } from "@/zap/components/blog/BlogPost";
import { Metadata } from "next";
import { MDXRemote } from "next-mdx-remote/rsc";
import { useMDXComponents as getMDXComponents } from "@/mdx-components";

interface BlogPostPageProps {
  params: { slug: string };
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const post = await getPostBySlug(params.slug);
  if (!post) return {};
  return {
    title: `${post.frontmatter.title} | Blog | Zap.ts`,
    description: post.frontmatter.excerpt,
    openGraph: {
      title: post.frontmatter.title,
      description: post.frontmatter.excerpt,
      images: post.frontmatter.image ? [post.frontmatter.image] : [],
    },
  };
}

const mdxComponents = getMDXComponents({});

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const post = await getPostBySlug(params.slug);
  if (!post) return notFound();
  return (
    <main className="container py-8">
      <BlogPost frontmatter={post.frontmatter}>
        <MDXRemote source={post.content} components={mdxComponents} />
      </BlogPost>
    </main>
  );
}
