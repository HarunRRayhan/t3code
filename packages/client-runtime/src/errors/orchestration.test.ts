import { CommandId, OrchestrationV2ThreadLaunchError, ProjectId } from "@t3tools/contracts";
import { describe, expect, it } from "vite-plus/test";

import { wasLaunchThreadIdTaken } from "./orchestration.ts";

const launchError = (reason?: "thread-id-taken") =>
  new OrchestrationV2ThreadLaunchError({
    commandId: CommandId.make("command-1"),
    projectId: ProjectId.make("project-1"),
    message: "Failed to launch thread",
    ...(reason === undefined ? {} : { reason }),
  });

describe("wasLaunchThreadIdTaken", () => {
  it("is true only for a launch error that names the taken thread id", () => {
    expect(wasLaunchThreadIdTaken(launchError("thread-id-taken"))).toBe(true);
    expect(wasLaunchThreadIdTaken(launchError())).toBe(false);
    expect(wasLaunchThreadIdTaken(new Error("Failed to launch thread"))).toBe(false);
  });
});
