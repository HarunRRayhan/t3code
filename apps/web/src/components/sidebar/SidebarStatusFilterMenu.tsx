import { useAtomValue } from "@effect/atom-react";
import { BellRingIcon, CircleCheckIcon, ListIcon, ZapIcon } from "lucide-react";

import { shortcutLabelForCommand } from "../../keybindings";
import { cn } from "../../lib/utils";
import { primaryServerKeybindingsAtom } from "../../state/server";
import type { SidebarStatusFilter } from "../Sidebar.logic";
import {
  Menu,
  MenuItemDetail,
  MenuPopup,
  MenuRadioGroup,
  MenuRadioItem,
  MenuShortcut,
  MenuTrigger,
} from "../ui/menu";
import { SidebarHeaderIconButton } from "./SidebarThreadHeader";
import { useSidebarStatusFilter } from "./sidebarStatusFilter";

const FILTERS = [
  { value: "all", Icon: ListIcon, name: "All", color: "" },
  {
    value: "action",
    Icon: BellRingIcon,
    name: "Attention needed",
    color: "text-amber-600 dark:text-amber-300/90",
  },
  { value: "working", Icon: ZapIcon, name: "Working", color: "text-sky-600 dark:text-sky-300/90" },
  {
    value: "done",
    Icon: CircleCheckIcon,
    name: "Done",
    color: "text-emerald-600 dark:text-emerald-300/90",
  },
] as const;

const isStatusFilter = (value: unknown): value is SidebarStatusFilter =>
  FILTERS.some((entry) => entry.value === value);

/** One header button for the status filter; its icon shows the selected status. */
export function SidebarStatusFilterMenu(props: {
  readonly counts: Readonly<Record<SidebarStatusFilter, number>>;
}) {
  const [filter, setFilter] = useSidebarStatusFilter();
  const keybindings = useAtomValue(primaryServerKeybindingsAtom);
  const selected = FILTERS.find((entry) => entry.value === filter) ?? FILTERS[0];

  return (
    <Menu>
      <MenuTrigger
        render={
          <SidebarHeaderIconButton
            label={`Filter threads by status: ${selected.name} (${props.counts[selected.value]})`}
          />
        }
      >
        <selected.Icon className={cn("size-4", selected.color)} />
      </MenuTrigger>
      <MenuPopup align="start" className="min-w-52">
        <MenuRadioGroup
          value={filter}
          onValueChange={(value) => {
            if (isStatusFilter(value)) setFilter(value);
          }}
        >
          {FILTERS.map((entry) => {
            const shortcut = shortcutLabelForCommand(keybindings, `sidebar.filter.${entry.value}`);
            return (
              <MenuRadioItem key={entry.value} value={entry.value} closeOnClick>
                <span className="flex min-w-0 items-center gap-2">
                  <entry.Icon className={cn("size-4", entry.color)} aria-hidden />
                  <span className="min-w-0 flex-1 truncate">{entry.name}</span>
                  <MenuItemDetail>{props.counts[entry.value]}</MenuItemDetail>
                  {shortcut ? <MenuShortcut>{shortcut}</MenuShortcut> : null}
                </span>
              </MenuRadioItem>
            );
          })}
        </MenuRadioGroup>
      </MenuPopup>
    </Menu>
  );
}
