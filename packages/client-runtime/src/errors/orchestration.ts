import {
  OrchestrationDispatchCommandError,
  OrchestrationV2ThreadLaunchError,
} from "@t3tools/contracts";
import * as Schema from "effect/Schema";

const isOrchestrationDispatchCommandError = Schema.is(OrchestrationDispatchCommandError);

export function wasBootstrapThreadDeleted(error: unknown): boolean {
  return (
    isOrchestrationDispatchCommandError(error) && error.bootstrapThreadDisposition === "deleted"
  );
}

export function wasBootstrapThreadNotCreated(error: unknown): boolean {
  return (
    isOrchestrationDispatchCommandError(error) && error.bootstrapThreadDisposition === "not-created"
  );
}

const isOrchestrationV2ThreadLaunchError = Schema.is(OrchestrationV2ThreadLaunchError);

export function wasLaunchThreadIdTaken(error: unknown): boolean {
  return isOrchestrationV2ThreadLaunchError(error) && error.reason === "thread-id-taken";
}
