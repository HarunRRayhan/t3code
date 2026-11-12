import { ActivityIcon, BellRingIcon, ListIcon } from "lucide-react";

import { useThreadUndoNotice } from "../../hooks/showThreadUndoNotice";
import { cn } from "../../lib/utils";
import type { SidebarStatusFilter } from "../Sidebar.logic";
import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group";
import { SidebarMenuItem } from "../ui/sidebar";
import { SidebarThreadUndoNotice } from "./SidebarThreadUndoNotice";
import { useSidebarStatusCounts, useSidebarStatusFilter } from "./sidebarStatusFilter";

const FILTERS = [
  {
    value: "all",
    Icon: ListIcon,
    name: "All threads",
    color: "text-emerald-600 dark:text-emerald-300/90",
  },
  {
    value: "action",
    Icon: BellRingIcon,
    name: "Action needed",
    color: "text-amber-600 dark:text-amber-300/90",
  },
  { value: "others", Icon: ActivityIcon, name: "Others", color: "text-muted-foreground" },
] as const;

const countLabel = (count: number) => (count > 99 ? "99+" : String(count));

/**
 * The footer's free space: a status filter, which a status update flips over like a
 * departures board and flips back from. One-shot transitions only, so nothing repaints at rest.
 */
export function SidebarStatusBoard() {
  const [filter, setFilter] = useSidebarStatusFilter();
  const noticeShown = useThreadUndoNotice((state) => state.notice !== null);
  const counts = useSidebarStatusCounts();

  return (
    <SidebarMenuItem className="relative flex h-6 min-w-0 flex-1 [perspective:400px]">
      <div
        aria-hidden={noticeShown}
        inert={noticeShown}
        className={cn(
          "absolute inset-0 flex items-center justify-center transition-[opacity,transform] duration-300 ease-out motion-reduce:transform-none",
          noticeShown && "opacity-0 [transform:rotateX(90deg)]",
        )}
      >
        <ToggleGroup
          aria-label="Filter threads by status"
          size="xs"
          value={[filter]}
          onValueChange={(next) => {
            const picked = next[0];
            if (picked !== undefined) setFilter(picked as SidebarStatusFilter);
          }}
        >
          {FILTERS.map((entry) => (
            <ToggleGroupItem
              key={entry.value}
              value={entry.value}
              aria-label={`${entry.name}: ${counts[entry.value]}`}
              title={entry.name}
            >
              <span className="relative grid place-items-center">
                <entry.Icon
                  className={cn(
                    "opacity-40",
                    filter === entry.value ? entry.color : "text-muted-foreground",
                  )}
                />
                <span
                  className={cn(
                    "pointer-events-none absolute text-3xs leading-none font-semibold tabular-nums",
                    entry.color,
                  )}
                >
                  {countLabel(counts[entry.value])}
                </span>
              </span>
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>
      <SidebarThreadUndoNotice />
    </SidebarMenuItem>
  );
}
