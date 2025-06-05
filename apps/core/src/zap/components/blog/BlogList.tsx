import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BlogFrontmatter } from "@/zap/schemas/blog.schema";

interface BlogListProps {
  posts: Array<BlogFrontmatter & { slug: string }>;
}

export function BlogList({ posts }: BlogListProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {posts.map((post) => (
        <Card key={post.slug}>
          <Link href={`/blog/${post.slug}`}>
            <CardHeader>
              <CardTitle>{post.title}</CardTitle>
              <span className="text-muted-foreground text-xs">
                {new Date(post.date).toLocaleDateString()}
              </span>
            </CardHeader>
            <CardContent>
              <p className="line-clamp-3 text-sm">{post.excerpt}</p>
            </CardContent>
          </Link>
        </Card>
      ))}
    </div>
  );
}
