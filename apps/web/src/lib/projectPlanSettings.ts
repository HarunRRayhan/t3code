import type { ClientSettings } from "@t3tools/contracts";

/** A project's Plan options: its own override where it has one, else the global setting. */
export function resolveProjectPlanSettings(
  settings: Pick<
    ClientSettings,
    "newThreadsStartInPlan" | "planModelSelection" | "projectPlanOverrides"
  >,
  projectKey: string | null | undefined,
) {
  const override = projectKey ? settings.projectPlanOverrides[projectKey] : undefined;
  return {
    startInPlan: override?.startInPlan ?? settings.newThreadsStartInPlan,
    planModelSelection:
      override?.planModelSelection !== undefined
        ? override.planModelSelection
        : settings.planModelSelection,
  };
}
