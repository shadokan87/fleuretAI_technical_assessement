"use client";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { ChevronLeft, ChevronRight, Share2, Pencil } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useTray } from "@/hooks/useTray";
import { useReportsCache } from "@/hooks/useReportsCache";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

const SEVERITY_VARIANT: Record<string, "destructive" | "default" | "secondary" | "outline"> = {
  Critical: "destructive",
  High: "destructive",
  Medium: "default",
  Low: "secondary",
  Info: "outline",
};

export default function TrayWidget() {
  const { trays, activeTrayId, setActiveTrayId, openManageModal } = useTray();
  const { cache } = useReportsCache();

  const activeIndex = trays.findIndex((t) => t.id === activeTrayId);
  const activeTray = activeIndex >= 0 ? trays[activeIndex] : null;

  const goPrev = () => {
    if (trays.length === 0) return;
    const prev = activeIndex <= 0 ? trays.length - 1 : activeIndex - 1;
    setActiveTrayId(trays[prev].id);
  };

  const goNext = () => {
    if (trays.length === 0) return;
    const next = activeIndex >= trays.length - 1 ? 0 : activeIndex + 1;
    setActiveTrayId(trays[next].id);
  };

  // Resolve vulnerability objects from the cache
  const allVulns = Object.values(cache).flatMap((r) => r.vulnerabilities);
  const vulnItems = activeTray
    ? activeTray.vulnerabilityIds
        .map((vid) => allVulns.find((v) => v.id === vid))
        .filter(Boolean)
    : [];

  if (trays.length === 0) return null;

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="px-0">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-0.5">
            <Button variant="ghost" size="icon" className="size-6" onClick={goPrev} disabled={trays.length <= 1}>
              <ChevronLeft className="size-3.5" />
            </Button>
            <span className="text-xs font-semibold truncate max-w-[100px]">
              {activeTray?.name ?? "No tray"}
            </span>
            <Button variant="ghost" size="icon" className="size-6" onClick={goNext} disabled={trays.length <= 1}>
              <ChevronRight className="size-3.5" />
            </Button>
          </div>
          <div className="flex items-center gap-0.5">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="size-6" disabled>
                  <Share2 className="size-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">Share</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="size-6" onClick={() => openManageModal()}>
                  <Pencil className="size-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">Manage trays</TooltipContent>
            </Tooltip>
          </div>
        </div>
      </SidebarGroupLabel>
      <SidebarGroupContent>
        {vulnItems.length === 0 ? (
          <p className="text-xs text-muted-foreground px-2 py-3">No vulnerabilities in this tray.</p>
        ) : (
          <SidebarMenu>
            {vulnItems.map((v) => (
              <SidebarMenuItem key={v!.id}>
                <SidebarMenuButton asChild className="h-auto py-1.5">
                  <Link href={`/vulnerability?id=${v!.id}`}>
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <span className="text-xs font-medium truncate">{v!.title}</span>
                      <div className="flex items-center gap-1.5">
                        <Badge variant={SEVERITY_VARIANT[v!.severity] ?? "outline"} className="text-[10px] px-1.5 py-0 h-4">
                          {v!.severity}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground truncate">{v!.asset}</span>
                      </div>
                    </div>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        )}
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
