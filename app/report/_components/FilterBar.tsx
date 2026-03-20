"use client";

import { ReactNode } from "react";
import { LucideIcon, Shield, Tag, Globe, CalendarIcon, X } from "lucide-react";
import { Severity, VULNERABILITY_CATEGORIES, Scope } from "@/api/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import Flex from "@/components/Flex";
import { Filters, initialFilters } from "../_types";

const SEVERITIES: Severity[] = ["Critical", "High", "Medium", "Low", "Info"];
const CATEGORIES = Object.keys(VULNERABILITY_CATEGORIES);

function FilterButton({
  icon: Icon,
  tooltip,
  popoverClassName,
  children,
}: {
  icon: LucideIcon;
  tooltip: string;
  popoverClassName?: string;
  children: ReactNode;
}) {
  return (
    <Popover>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <Button variant="outline" size="icon">
              <Icon className="size-4" />
            </Button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent>{tooltip}</TooltipContent>
      </Tooltip>
      <PopoverContent className={popoverClassName} align="end">
        {children}
      </PopoverContent>
    </Popover>
  );
}

interface FilterBarProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  scopes: Scope[];
}

export default function FilterBar({
  filters,
  onFiltersChange,
  scopes,
}: FilterBarProps) {
  const updateFilter = <K extends keyof Filters>(key: K, value: Filters[K]) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const toggleArrayFilter = <K extends "severities" | "categories" | "scopes">(
    key: K,
    value: string,
  ) => {
    const current = filters[key] as string[];
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    updateFilter(key, next as Filters[K]);
  };

  const clearFilters = () => onFiltersChange(initialFilters);

  const hasActiveFilters =
    filters.severities.length > 0 ||
    filters.categories.length > 0 ||
    filters.scopes.length > 0 ||
    filters.dateRange.from != null ||
    filters.dateRange.to != null;

  return (
    <Flex col gap={3}>
      {/* Search + icon filter buttons */}
      <Flex gap={2} className="items-center">
        <Input
          placeholder="Search vulnerabilities…"
          value={filters.search}
          onChange={(e) => updateFilter("search", e.target.value)}
          className="flex-1"
        />

        {/* Severity */}
        <FilterButton icon={Shield} tooltip="Severity filter" popoverClassName="w-48">
          <Flex col gap={1}>
            <span className="text-sm font-medium mb-1">Severity</span>
            {SEVERITIES.map((s) => (
              <Button
                key={s}
                variant={filters.severities.includes(s) ? "default" : "ghost"}
                size="sm"
                className="justify-start"
                onClick={() => toggleArrayFilter("severities", s)}
              >
                {s}
              </Button>
            ))}
          </Flex>
        </FilterButton>

        {/* Category */}
        <FilterButton icon={Tag} tooltip="Category filter" popoverClassName="w-56">
          <Flex col gap={1}>
            <span className="text-sm font-medium mb-1">Category</span>
            {CATEGORIES.map((c) => (
              <Button
                key={c}
                variant={filters.categories.includes(c) ? "default" : "ghost"}
                size="sm"
                className="justify-start"
                onClick={() => toggleArrayFilter("categories", c)}
              >
                {c}
              </Button>
            ))}
          </Flex>
        </FilterButton>

        {/* Scope */}
        <FilterButton icon={Globe} tooltip="Scope filter" popoverClassName="w-56">
          <Flex col gap={1}>
            <span className="text-sm font-medium mb-1">Scope</span>
            {scopes.map((scope) => (
              <Button
                key={scope.id}
                variant={
                  filters.scopes.includes(scope.id) ? "default" : "ghost"
                }
                size="sm"
                className="justify-start"
                onClick={() => toggleArrayFilter("scopes", scope.id)}
              >
                {scope.domain ?? scope.ipAddress}
              </Button>
            ))}
          </Flex>
        </FilterButton>

        {/* Date range */}
        <FilterButton icon={CalendarIcon} tooltip="Date range filter" popoverClassName="w-auto">
          <Flex col gap={2}>
            <span className="text-sm font-medium">Date range</span>
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={filters.dateRange.from}
              selected={{ from: filters.dateRange.from, to: filters.dateRange.to }}
              onSelect={(range) =>
                updateFilter("dateRange", {
                  from: range?.from,
                  to: range?.to,
                })
              }
              numberOfMonths={2}
            />
          </Flex>
        </FilterButton>
      </Flex>

      {/* Active filter badges */}
      {hasActiveFilters && (
        <Flex gap={2} className="items-center flex-wrap">
          {filters.severities.length > 0 && (
            <Flex gap={1} className="items-center">
              <span className="text-xs text-muted-foreground">Severity</span>
              {filters.severities.map((s) => (
                <Badge
                  key={s}
                  variant="secondary"
                  className="gap-1 cursor-pointer"
                  onClick={() => toggleArrayFilter("severities", s)}
                >
                  {s}
                  <X className="size-3" />
                </Badge>
              ))}
            </Flex>
          )}

          {filters.severities.length > 0 && filters.categories.length > 0 && (
            <Separator orientation="vertical" className="h-4" />
          )}

          {filters.categories.length > 0 && (
            <Flex gap={1} className="items-center">
              <span className="text-xs text-muted-foreground">Category</span>
              {filters.categories.map((c) => (
                <Badge
                  key={c}
                  variant="secondary"
                  className="gap-1 cursor-pointer"
                  onClick={() => toggleArrayFilter("categories", c)}
                >
                  {c}
                  <X className="size-3" />
                </Badge>
              ))}
            </Flex>
          )}

          {(filters.severities.length > 0 || filters.categories.length > 0) &&
            filters.scopes.length > 0 && (
              <Separator orientation="vertical" className="h-4" />
            )}

          {filters.scopes.length > 0 && (
            <Flex gap={1} className="items-center">
              <span className="text-xs text-muted-foreground">Scope</span>
              {filters.scopes.map((scopeId) => {
                const scope = scopes.find((s) => s.id === scopeId);
                return (
                  <Badge
                    key={scopeId}
                    variant="secondary"
                    className="gap-1 cursor-pointer"
                    onClick={() => toggleArrayFilter("scopes", scopeId)}
                  >
                    {scope?.domain ?? scope?.ipAddress ?? scopeId}
                    <X className="size-3" />
                  </Badge>
                );
              })}
            </Flex>
          )}

          {(filters.severities.length > 0 ||
            filters.categories.length > 0 ||
            filters.scopes.length > 0) &&
            (filters.dateRange.from || filters.dateRange.to) && (
              <Separator orientation="vertical" className="h-4" />
            )}

          {(filters.dateRange.from || filters.dateRange.to) && (
            <Flex gap={1} className="items-center">
              <span className="text-xs text-muted-foreground">Date</span>
              {filters.dateRange.from && (
                <Badge
                  variant="secondary"
                  className="gap-1 cursor-pointer"
                  onClick={() =>
                    updateFilter("dateRange", {
                      ...filters.dateRange,
                      from: undefined,
                    })
                  }
                >
                  From: {filters.dateRange.from.toLocaleDateString()}
                  <X className="size-3" />
                </Badge>
              )}
              {filters.dateRange.to && (
                <Badge
                  variant="secondary"
                  className="gap-1 cursor-pointer"
                  onClick={() =>
                    updateFilter("dateRange", {
                      ...filters.dateRange,
                      to: undefined,
                    })
                  }
                >
                  To: {filters.dateRange.to.toLocaleDateString()}
                  <X className="size-3" />
                </Badge>
              )}
            </Flex>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="ml-auto"
          >
            Clear filters
          </Button>
        </Flex>
      )}
    </Flex>
  );
}
