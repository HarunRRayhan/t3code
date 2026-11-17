import * as Schema from "effect/Schema";

import { useLocalStorage } from "../../hooks/useLocalStorage";
import type { SidebarStatusFilter } from "../Sidebar.logic";

const SidebarStatusFilterSchema = Schema.Literals(["all", "action", "working", "done"]);

export function useSidebarStatusFilter() {
  return useLocalStorage<SidebarStatusFilter, SidebarStatusFilter>(
    "t3code:sidebar:status-filter",
    "all",
    SidebarStatusFilterSchema,
  );
}
