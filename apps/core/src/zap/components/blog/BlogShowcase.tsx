import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BlogFrontmatter } from "@/zap/schemas/blog.schema";

interface BlogShowcaseProps {
  posts: Array<BlogFrontmatter & { slug: string }>;
}

export function BlogShowcase({ posts }: BlogShowcaseProps) {
  const showcase = posts.slice(0, 3);
  return (
    <div className="flex gap-4 overflow-x-auto py-4">
      {showcase.map((post) => (
        <Card key={post.slug} className="max-w-xs min-w-[250px] flex-shrink-0">
          <Link href={`/blog/${post.slug}`}>
            <CardHeader>
              <CardTitle className="text-base">{post.title}</CardTitle>
              <span className="text-muted-foreground text-xs">
                {new Date(post.date).toLocaleDateString()}
              </span>
            </CardHeader>
            <CardContent>
              <p className="line-clamp-2 text-xs">{post.excerpt}</p>
            </CardContent>
          </Link>
        </Card>
      ))}
    </div>
  );
}
