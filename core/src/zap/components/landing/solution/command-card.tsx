"use client";

import { Check, Clipboard } from "lucide-react";
import { useState } from "react";

import {
  AnimatedSpan,
  Terminal,
  TypingAnimation,
} from "@/components/magicui/terminal";
import { Button } from "@/components/ui/button";

interface CommandCardProps {
  command: string;
  description: string;
}

export function CommandCard({ command, description }: CommandCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-background hidden h-fit space-y-4 rounded-xl border p-6 md:block">
      <Terminal className="rounded-md border shadow-sm">
        <div className="flex items-center justify-between">
          <code className="text-muted-foreground text-sm whitespace-nowrap">
            {command}
          </code>

          <Button
            className="ml-4"
            onClick={handleCopy}
            size="icon"
            variant="ghost"
          >
            {copied ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <Clipboard className="h-4 w-4" />
            )}
          </Button>
        </div>

        <AnimatedSpan className="text-green-500" delay={1500}>
          <span>
            ✔ &apos;pnpm&apos; has been selected as the package manager.
          </span>
        </AnimatedSpan>

        <AnimatedSpan className="text-green-500" delay={2000}>
          <span>✔ Copying core files.</span>
        </AnimatedSpan>

        <AnimatedSpan className="text-green-500" delay={2500}>
          <span>✔ Installing dependencies.</span>
        </AnimatedSpan>

        <AnimatedSpan className="text-blue-500" delay={3000}>
          <span>✔ Running prettier on the project.</span>
        </AnimatedSpan>

        <TypingAnimation className="text-muted-foreground" delay={4000}>
          Success! Project initialization completed.
        </TypingAnimation>
      </Terminal>

      <p className="text-muted-foreground text-sm">{description}</p>
    </div>
  );
}
