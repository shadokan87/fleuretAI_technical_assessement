"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ReportsCacheProvider } from "@/hooks/useReportsCache";
import { TrayProvider } from "@/hooks/useTray";
import ManageTrayModal from "@/components/ManageTrayModal";

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <ReportsCacheProvider>
        <TrayProvider>
          <TooltipProvider>{children}</TooltipProvider>
          <ManageTrayModal />
        </TrayProvider>
      </ReportsCacheProvider>
    </QueryClientProvider>
  );
}
