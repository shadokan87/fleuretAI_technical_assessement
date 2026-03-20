"use client";

import { Suspense, useEffect, useState } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LayoutDashboard, ShieldAlert, Moon, Sun, LogOut, ChevronsUpDown, FileText, Check } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTheme } from "next-themes";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import TrayWidget from "@/components/TrayWidget";
import { ReportListItem } from "@/api/types";

const MOCK_USER = {
  firstName: "Alice",
  lastName: "Dupont",
  email: "alice.dupont@fleuret.ai",
};

const NAV_ITEMS = [
  { label: "Report", href: "/report", icon: LayoutDashboard },
  { label: "Vulnerabilities explorer", href: "/vulnerability", icon: ShieldAlert },
];

export default function AppSidebar() {
  return (
    <Suspense>
      <AppSidebarInner />
    </Suspense>
  );
}

function AppSidebarInner() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { theme, setTheme } = useTheme();

  const [reports, setReports] = useState<ReportListItem[]>([]);
  const activeReportId = searchParams.get("reportId") ?? "report-001";
  const activeReport = reports.find((r) => r.id === activeReportId);

  useEffect(() => {
    fetch("/api/reports")
      .then((res) => res.json())
      .then(setReports)
      .catch(() => {});
  }, []);

  return (
    <Sidebar variant="floating">
      <SidebarHeader className="px-4 py-4">
        <span className="text-lg font-semibold tracking-tight">FleuretAI</span>

        {/* Report selector */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton className="mt-1 w-full">
              <FileText className="size-4 shrink-0" />
              <span className="truncate text-sm">
                {activeReport?.name ?? activeReportId}
              </span>
              <ChevronsUpDown className="ml-auto size-3.5 shrink-0 text-muted-foreground" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-64">
            {reports.map((report) => (
              <DropdownMenuItem
                key={report.id}
                onClick={() => router.push(`/report?reportId=${report.id}`)}
                className="flex items-center gap-2"
              >
                {report.id === activeReportId ? (
                  <Check className="size-3.5 shrink-0" />
                ) : (
                  <span className="size-3.5 shrink-0" />
                )}
                <div className="flex flex-col min-w-0">
                  <span className="truncate text-sm">{report.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(report.scanDate).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_ITEMS.map(({ label, href, icon: Icon }) => (
                <SidebarMenuItem key={href}>
                  <SidebarMenuButton asChild isActive={pathname.startsWith(href)}>
                    <Link href={href}>
                      <Icon className="size-4" />
                      <span>{label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <TrayWidget />
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton size="lg">
                  <Avatar className="size-8">
                    <AvatarFallback className="text-xs font-semibold">
                      {MOCK_USER.firstName[0]}{MOCK_USER.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-sm font-medium truncate">
                      {MOCK_USER.firstName} {MOCK_USER.lastName}
                    </span>
                    <span className="text-xs text-muted-foreground truncate">
                      {MOCK_USER.email}
                    </span>
                  </div>
                  <ChevronsUpDown className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" align="start" className="w-(--radix-dropdown-menu-trigger-width)">
                <DropdownMenuItem onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
                  {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
                  <span>{theme === "dark" ? "Light mode" : "Dark mode"}</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10">
                  <LogOut className="size-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
