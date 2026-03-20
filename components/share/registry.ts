import type { ShareAdapter } from "./types";
import { emailAdapter } from "./adapters/ShareEmail";
import { linearAdapter } from "./adapters/ShareLinear";

/**
 * Registry of all share adapters.
 * To add a new adapter (e.g. Jira, Slack), create the file in adapters/
 * and append it here.
 */
export const shareAdapters: ShareAdapter[] = [emailAdapter, linearAdapter];
