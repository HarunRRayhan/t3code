import { useThreadUndoNotice } from "../../hooks/showThreadUndoNotice";
import { useQuietThreadShells } from "../../state/entities";
import { cn } from "../../lib/utils";
import { isThreadActionNeeded, type SidebarStatusFilter } from "../Sidebar.logic";
import { ToggleGroup, ToggleGroupItem } from "../ui/toggle-group";
import { SidebarMenuItem } from "../ui/sidebar";
import { SidebarThreadUndoNotice } from "./SidebarThreadUndoNotice";
import { useSidebarStatusFilter } from "./sidebarStatusFilter";

const FILTERS = [
  { value: "all", label: "All", name: "All threads" },
  { value: "action", label: "Action", name: "Action needed" },
  { value: "others", label: "Others", name: "Others" },
] as const satisfies ReadonlyArray<{ value: SidebarStatusFilter; label: string; name: string }>;

/**
 * The footer's free space: a status filter, which a status update flips over like a
 * departures board and flips back from. One-shot transitions only, so nothing repaints at rest.
 */
export function SidebarStatusBoard() {
  const [filter, setFilter] = useSidebarStatusFilter();
  const noticeShown = useThreadUndoNotice((state) => state.notice !== null);
  const actionCount = useQuietThreadShells().filter(
    (thread) =>
      thread.archivedAt == null &&
      thread.deletedAt == null &&
      thread.settledOverride !== "settled" &&
      isThreadActionNeeded(thread),
  ).length;

  return (
    <SidebarMenuItem className="relative flex h-6 min-w-0 flex-1 [perspective:400px]">
      <div
        aria-hidden={noticeShown}
        inert={noticeShown}
        className={cn(
          "absolute inset-0 flex items-center transition-[opacity,transform] duration-300 ease-out motion-reduce:transform-none",
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
              aria-label={entry.name}
              title={
                entry.value === "action" && actionCount > 0
                  ? `${entry.name}: ${actionCount}`
                  : entry.name
              }
            >
              {entry.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>
      <SidebarThreadUndoNotice />
    </SidebarMenuItem>
  );
}
