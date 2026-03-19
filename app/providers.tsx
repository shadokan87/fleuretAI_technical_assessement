"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ReportsCacheProvider } from "@/hooks/useReportsCache";

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <ReportsCacheProvider>
        <TooltipProvider>{children}</TooltipProvider>
      </ReportsCacheProvider>
    </QueryClientProvider>
  );
}
