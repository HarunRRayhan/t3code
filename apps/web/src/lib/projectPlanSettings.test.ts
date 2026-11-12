import { ProviderInstanceId } from "@t3tools/contracts";
import { describe, expect, it } from "vite-plus/test";

import { resolveProjectPlanSettings } from "./projectPlanSettings";

describe("resolveProjectPlanSettings", () => {
  const model = (name: string) => ({ instanceId: ProviderInstanceId.make("claude"), model: name });
  const global = {
    newThreadsStartInPlan: true,
    planModelSelection: model("opus") as ReturnType<typeof model> | null,
    projectPlanOverrides: {
      mine: { startInPlan: false },
      pinned: { planModelSelection: model("haiku") },
      plain: { planModelSelection: null },
    },
  };

  it.each([
    { name: "no project inherits the global values", key: null, want: [true, model("opus")] },
    { name: "an unlisted project inherits both", key: "other", want: [true, model("opus")] },
    {
      name: "an override of one field inherits the other",
      key: "mine",
      want: [false, model("opus")],
    },
    {
      name: "a project plan model replaces the global one",
      key: "pinned",
      want: [true, model("haiku")],
    },
    { name: "a null project plan model means same as default", key: "plain", want: [true, null] },
  ])("$name", ({ key, want }) => {
    const resolved = resolveProjectPlanSettings(global, key);
    expect([resolved.startInPlan, resolved.planModelSelection]).toEqual(want);
  });
});
