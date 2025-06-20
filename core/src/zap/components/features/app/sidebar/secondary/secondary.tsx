"use client";

import { Bot, HelpCircle, Settings } from "lucide-react";
import Link from "next/link";
import * as React from "react";
import { useState } from "react";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { AISettingsSheet } from "@/zap/components/features/ai/settings-panel/settings-panel";
import { FeedbackDialog } from "@/zap/components/features/app/sidebar/feedback-dialog/feedback-dialog";

export function NavSecondary({
  ...props
}: {} & React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
  const [isFeedbackOpen, setFeedbackOpen] = useState(false);
  const [isAISettingsOpen, setAISettingsOpen] = useState(false);

  return (
    <>
      <SidebarGroup {...props}>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={() => setAISettingsOpen(true)}>
                <Bot />
                <span>AI Settings</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={() => setFeedbackOpen(true)}>
                <HelpCircle />
                <span>Give Feedback</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link href="/app/settings">
                  <Settings />
                  <span>Settings</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      <AISettingsSheet
        open={isAISettingsOpen}
        onOpenChange={setAISettingsOpen}
      />
      <FeedbackDialog open={isFeedbackOpen} onOpenChange={setFeedbackOpen} />
    </>
  );
}
