import * as Schema from "effect/Schema";
import { create } from "zustand";

import { useLocalStorage } from "../../hooks/useLocalStorage";
import type { SidebarStatusFilter } from "../Sidebar.logic";

const SidebarStatusFilterSchema = Schema.Literals(["all", "action", "others"]);

export function useSidebarStatusFilter() {
  return useLocalStorage<SidebarStatusFilter, SidebarStatusFilter>(
    "t3code:sidebar:status-filter",
    "all",
    SidebarStatusFilterSchema,
  );
}

export interface SidebarStatusCounts {
  readonly all: number;
  readonly action: number;
  readonly others: number;
}

/** Counts of the threads the list can show, published by the list so the footer matches it. */
export const useSidebarStatusCounts = create<SidebarStatusCounts>(() => ({
  all: 0,
  action: 0,
  others: 0,
}));

export function publishSidebarStatusCounts(next: SidebarStatusCounts) {
  const current = useSidebarStatusCounts.getState();
  if (
    current.all !== next.all ||
    current.action !== next.action ||
    current.others !== next.others
  ) {
    useSidebarStatusCounts.setState(next);
  }
}
