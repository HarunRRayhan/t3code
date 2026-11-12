import { useAtomValue } from "@effect/atom-react";
import { Undo2Icon } from "lucide-react";
import { useState } from "react";

import {
  threadUndoLabel,
  undoLatestThreadAction,
  useThreadUndoNotice,
} from "../../hooks/showThreadUndoNotice";
import { cn } from "../../lib/utils";
import { primaryServerKeybindingsAtom } from "../../state/server";
import { InlineButton } from "../ui/button";

/** Flips in over the status filter in the footer's utility row; the board owns the row item. */
export function SidebarThreadUndoNotice() {
  const notice = useThreadUndoNotice((state) => state.notice);
  const keybindings = useAtomValue(primaryServerKeybindingsAtom);
  // Short enough to fit beside the utility icons; screen readers hear the full summary.
  const summary = notice
    ? notice.count === 1
      ? notice.action
      : `${notice.action} ${notice.count}`
    : null;

  // Keeps the last text on screen while it fades out, then unmounts on transitionend.
  const [shownSummary, setShownSummary] = useState(summary);
  if (summary && summary !== shownSummary) setShownSummary(summary);
  const text = summary ?? shownSummary;
  if (!text) return null;

  return (
    <div
      aria-hidden={!summary}
      inert={!summary}
      onTransitionEnd={(event) => {
        if (!summary && event.target === event.currentTarget) setShownSummary(null);
      }}
      className={cn(
        "@container absolute inset-0 flex min-w-0 transition-[opacity,transform] duration-300 ease-out [transform-origin:50%_50%] starting:opacity-0 starting:[transform:rotateX(90deg)] motion-reduce:transform-none",
        !summary && "opacity-0 [transform:rotateX(-90deg)]",
      )}
    >
      <div
        // Reversed wrap: a summary that does not fit beside the undo button drops to a
        // second line that overflow hides, instead of truncating mid-word. Browse mode
        // reads the button first; the live announcement carries the full sentence.
        className="flex h-6 min-w-0 flex-1 flex-row-reverse flex-wrap gap-x-1 overflow-hidden text-2xs leading-6 whitespace-nowrap text-sidebar-muted-foreground"
      >
        <InlineButton className="min-w-0 shrink" onClick={undoLatestThreadAction}>
          {/* The icon's negative margin cancels its width, so beside the label it sits in
              clipped space; once the label is too wide it wraps away and the icon shows. */}
          <span className="flex h-6 min-w-0 flex-wrap justify-end overflow-hidden">
            <Undo2Icon className="-ml-4 h-6 w-4 @max-[1rem]:invisible" />
            <span>{threadUndoLabel(keybindings)}</span>
          </span>
        </InlineButton>
        <span>{text},</span>
      </div>
    </div>
  );
}
