import { useState } from "react";
import { BellRingIcon, CircleCheckIcon, ListIcon, ZapIcon } from "lucide-react";

import { cn } from "../../lib/utils";
import type { SidebarStatusFilter, SidebarStatusGroup } from "../Sidebar.logic";
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

/** The open thread's status; the icon flips once when the status changes, not when another thread opens. */
function ActiveThreadStatusIcon(props: {
  readonly threadKey: string;
  readonly group: SidebarStatusGroup;
}) {
  const [seen, setSeen] = useState({ threadKey: props.threadKey, group: props.group, flips: 0 });
  if (seen.threadKey !== props.threadKey) {
    setSeen({ threadKey: props.threadKey, group: props.group, flips: 0 });
  } else if (seen.group !== props.group) {
    setSeen({ threadKey: props.threadKey, group: props.group, flips: seen.flips + 1 });
  }
  const entry = FILTERS.find((candidate) => candidate.value === props.group);
  if (!entry) return null;
  return (
    <span
      key={seen.flips}
      role="img"
      aria-label={`This thread: ${entry.name}`}
      className={cn(
        "grid size-6 place-items-center",
        seen.flips > 0 && "motion-safe:animate-status-flip",
      )}
    >
      <entry.Icon className={cn("size-4", entry.color)} aria-hidden />
    </span>
  );
}

/** One toggle per filter option, led by the open thread's own status. */
export function SidebarStatusFilterIcons(props: {
  readonly counts: Readonly<Record<SidebarStatusFilter, number>>;
  readonly activeThread: { readonly key: string; readonly group: SidebarStatusGroup } | null;
}) {
  const [filter, setFilter] = useSidebarStatusFilter();

  return (
    <SidebarMenuItem className="order-first flex w-full basis-full justify-center">
      <div className="flex items-center gap-3">
        {props.activeThread ? (
          <ActiveThreadStatusIcon
            threadKey={props.activeThread.key}
            group={props.activeThread.group}
          />
        ) : null}
        <div role="group" aria-label="Filter threads by status" className="flex items-center gap-2">
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
                    className={cn(
                      "size-4",
                      selected ? entry.color : "text-sidebar-muted-foreground",
                    )}
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
      </div>
    </SidebarMenuItem>
  );
}
