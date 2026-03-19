import { Severity, VULNERABILITY_CATEGORIES } from "@/api/types";

export interface Filters {
  search: string;
  severities: Severity[];
  categories: string[];
  scopes: string[];
  dateRange: { from: Date | undefined; to: Date | undefined };
}

export const initialFilters: Filters = {
  search: "",
  severities: [],
  categories: [],
  scopes: [],
  dateRange: { from: undefined, to: undefined },
};

export function getCategoryForTitle(title: string): string {
  for (const [category, titles] of Object.entries(VULNERABILITY_CATEGORIES)) {
    if ((titles as readonly string[]).includes(title)) return category;
  }
  return "Other";
}
