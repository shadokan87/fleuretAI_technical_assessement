import { type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import type { Vulnerability } from "@/api/types";

/** Data passed to every share adapter */
export interface SharePayload {
  trayName: string;
  vulnerabilities: Vulnerability[];
  /** Absolute base URL of the app (e.g. http://localhost:3000) */
  baseUrl: string;
}

/** Port – every share adapter must satisfy this contract */
export interface ShareAdapter {
  /** Unique key used for routing inside the modal */
  id: string;
  /** Human-readable label shown in the option grid */
  label: string;
  /** Icon displayed alongside the label. Can be a Lucide icon component or any ReactNode. */
  icon: LucideIcon | ReactNode;
  /** Accent color for the option tile (Tailwind class) — only applied when icon is a LucideIcon component */
  color: string;
  /**
   * React component rendered when this adapter is selected.
   * Receives the payload + a close callback.
   */
  Component: React.ComponentType<ShareAdapterProps>;
}

export interface ShareAdapterProps {
  payload: SharePayload;
  onClose: () => void;
}
