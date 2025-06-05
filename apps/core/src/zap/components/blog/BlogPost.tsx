import Image from "next/image";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { BlogFrontmatter } from "@/zap/schemas/blog.schema";

interface BlogPostProps {
  frontmatter: BlogFrontmatter;
  children: React.ReactNode;
}

export function BlogPost({ frontmatter, children }: BlogPostProps) {
  return (
    <Card className="mx-auto max-w-2xl">
      <CardHeader>
        <CardTitle>{frontmatter.title}</CardTitle>
        <span className="text-muted-foreground text-xs">
          {new Date(frontmatter.date).toLocaleDateString()}
        </span>
        {frontmatter.image && (
          <div className="mt-4">
            <Image
              src={frontmatter.image}
              alt={frontmatter.title}
              width={800}
              height={400}
              className="rounded"
            />
          </div>
        )}
      </CardHeader>
      <CardContent className="prose dark:prose-invert mt-4 max-w-none">
        {children}
      </CardContent>
    </Card>
  );
}
