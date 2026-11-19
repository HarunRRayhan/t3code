import { BellRingIcon, CircleCheckIcon, ListIcon, ZapIcon } from "lucide-react";

import { cn } from "../../lib/utils";
import type { SidebarStatusFilter } from "../Sidebar.logic";
import { SidebarMenuItem } from "../ui/sidebar";
import { Toggle } from "../ui/toggle";
import { useSidebarStatusFilter } from "./sidebarStatusFilter";

const FILTERS = [
  { value: "all", Icon: ListIcon, name: "All", color: "text-sidebar-foreground" },
  {
    value: "action",
    Icon: BellRingIcon,
    name: "Attention",
    color: "text-amber-600 dark:text-amber-300/90",
  },
  {
    value: "done",
    Icon: CircleCheckIcon,
    name: "Done",
    color: "text-emerald-600 dark:text-emerald-300/90",
  },
  { value: "working", Icon: ZapIcon, name: "Working", color: "text-sky-600 dark:text-sky-300/90" },
] as const;

/** One toggle per filter option. */
export function SidebarStatusFilterIcons(props: {
  readonly counts: Readonly<Record<SidebarStatusFilter, number>>;
}) {
  const [filter, setFilter] = useSidebarStatusFilter();

  return (
    <SidebarMenuItem className="order-first flex w-full basis-full justify-start">
      <div
        role="group"
        aria-label="Filter threads by status"
        className="ml-1 flex items-center gap-2"
      >
        {FILTERS.map((entry) => {
          const count = props.counts[entry.value];
          const selected = filter === entry.value;
          return (
            <Toggle
              key={entry.value}
              size="xs"
              variant="ghost"
              pressed={selected}
              onPressedChange={() => setFilter(entry.value)}
              aria-label={`${entry.name}: ${count}`}
              title={entry.name}
            >
              <span className="relative grid place-items-center">
                <entry.Icon
                  className={cn("size-4", selected ? entry.color : "text-sidebar-muted-foreground")}
                  aria-hidden
                />
                <span
                  aria-hidden
                  className={cn(
                    "pointer-events-none absolute -right-1.5 -bottom-1.5 text-3xs leading-none font-bold tabular-nums [paint-order:stroke] [-webkit-text-stroke:2.5px_var(--sidebar)]",
                    entry.color,
                  )}
                >
                  {count > 99 ? "99+" : count}
                </span>
              </span>
            </Toggle>
          );
        })}
      </div>
    </SidebarMenuItem>
  );
}
