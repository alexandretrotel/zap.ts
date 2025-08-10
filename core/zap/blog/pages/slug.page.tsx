import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { BlogPosting, WithContext } from "schema-dts";
import serialize from "serialize-javascript";

import { BASE_URL } from "@/zap.config";
import { CustomMDX } from "@/zap/markdown/mdx";

import {
  formatDate,
  generateBlogPostMetadata,
  getBlogPost,
  getBlogPostsMetadata,
} from "../utils";

export async function _generateMetadata({
  params,
}: _BlogSlugPageProps): Promise<Metadata> {
  const { slug } = await params;
  return await generateBlogPostMetadata(slug);
}

export async function _generateStaticParams() {
  const posts = await getBlogPostsMetadata();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export interface _BlogSlugPageProps {
  params: Promise<{ slug: string }>;
}

export async function _BlogSlugPage({ params }: _BlogSlugPageProps) {
  const { slug } = await params;
  const post = await getBlogPost(slug);

  if (!post) {
    notFound();
  }

  const jsonLd: WithContext<BlogPosting> = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.metadata.title,
    datePublished: new Date(post.metadata.date).toISOString(),
    dateModified: new Date(post.metadata.date).toISOString(),
    description: post.metadata.description,
    image:
      post.metadata.image ||
      `${BASE_URL}/opengraph-image?title=${post.metadata.title}`,
    url: `${BASE_URL}/blog/${post.slug}`,
    ...(post.metadata.author && {
      author: {
        "@type": "Person",
        name: post.metadata.author,
      },
    }),
  };

  return (
    <div className="container mx-auto max-w-4xl py-12">
      <script
        dangerouslySetInnerHTML={{ __html: serialize(jsonLd) }}
        suppressHydrationWarning
        type="application/ld+json"
      />
      <article className="prose prose-gray dark:prose-invert max-w-none">
        <div className="mb-8">
          {post.metadata.date && (
            <p className="text-muted-foreground mb-2 text-sm">
              {formatDate(post.metadata.date, true)}
            </p>
          )}

          <h1 className="mb-4 text-4xl font-bold">{post.metadata.title}</h1>
        </div>

        <div className="prose-content">
          <CustomMDX source={post.content} />
        </div>
      </article>
    </div>
  );
}
