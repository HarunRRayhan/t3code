import {
  type DraftId,
  deriveEffectiveComposerModelState,
  useComposerDraftModelState,
} from "../../composerDraftStore";
import {
  type ModelSelection,
  type ProjectId,
  ProviderDriverKind,
  type ScopedThreadRef,
  type ServerProvider,
} from "@t3tools/contracts";
import {
  NO_PROVIDER_MODEL_SELECTION,
  providerInstanceEntriesFor,
  type ProviderInstanceEntry,
} from "../../providerInstances";
import { type UnifiedSettings } from "@t3tools/contracts/settings";
import { getComposerPromptInjectionState, getComposerProviderState } from "./composerProviderState";
import { resolveComposerProviderSelection, resolveModeModelOverride } from "../ChatView.logic";

const NO_PROVIDER_MODELS: ServerProvider["models"] = [];

/**
 * The provider instances the composer offers, which one is selected, and the model and options
 * the draft resolves to on it. The draft store is read first so every derivation follows the only
 * hook here; in the composer body they would straddle its later hooks and lose their cache.
 */
export function useComposerProviderModel(
  input: Omit<Parameters<typeof resolveComposerProviderSelection>[0], "entries"> & {
    readonly providerStatuses: ReadonlyArray<ServerProvider>;
    readonly settings: UnifiedSettings;
    readonly activeProjectId: ProjectId | null;
    readonly threadRef: ScopedThreadRef | DraftId;
    readonly threadModelSelection: ModelSelection | null | undefined;
    readonly projectModelSelection: ModelSelection | null | undefined;
    readonly promptInjectionState: ReturnType<typeof getComposerPromptInjectionState>;
    /** Plan mode runs on the Plan model (settings.planModelSelection). */
    readonly planMode: boolean;
  },
) {
  const {
    providerStatuses,
    settings,
    activeProjectId,
    threadRef,
    threadModelSelection,
    projectModelSelection,
    promptInjectionState,
    planMode,
    candidateInstanceIds,
    lockedProvider,
    lockedInstanceId,
  } = input;
  const draftModelState = useComposerDraftModelState(threadRef);
  const providerInstanceEntries: ReadonlyArray<ProviderInstanceEntry> = providerInstanceEntriesFor(
    providerStatuses,
    settings,
    activeProjectId,
  );
  const planModel = settings.planModelSelection ?? null;
  const buildModel = settings.buildModelSelection ?? null;
  const planFirst = planMode && settings.planModeEnabled && planModel !== null;
  const selection = resolveComposerProviderSelection({
    entries: providerInstanceEntries,
    candidateInstanceIds: planFirst
      ? [planModel.instanceId, ...candidateInstanceIds]
      : candidateInstanceIds,
    lockedProvider,
    lockedInstanceId,
  });
  const selectedInstanceId =
    selection.selectedProviderEntry?.instanceId ?? NO_PROVIDER_MODEL_SELECTION.instanceId;
  const selectedProvider: ProviderDriverKind =
    selection.selectedProviderEntry?.driverKind ?? selection.requestedDriverKind;
  const modeOverride = resolveModeModelOverride({
    planMode: planMode && settings.planModeEnabled,
    planModel,
    buildModel,
    threadModelSelection,
    selectedInstanceId,
  });
  const modelState = deriveEffectiveComposerModelState({
    draft: modeOverride
      ? {
          activeProvider: modeOverride.instanceId,
          modelSelectionByProvider: { [modeOverride.instanceId]: modeOverride },
        }
      : draftModelState,
    providers: providerStatuses,
    selectedProvider,
    selectedInstanceId,
    requestedInstanceId: selection.requestedInstanceId,
    threadModelSelection: modeOverride ?? threadModelSelection,
    projectModelSelection,
    settings,
  });
  const selectedProviderModels = selection.selectedProviderEntry?.models ?? NO_PROVIDER_MODELS;
  const composerProviderState = getComposerProviderState({
    provider: selectedProvider,
    model: modelState.selectedModel,
    models: selectedProviderModels,
    promptInjectionState,
    modelOptions: modelState.modelOptions?.[selectedInstanceId],
    includePlanAgent: settings.planModeEnabled,
  });
  // Implement leaves Plan mode, so it sends on the Build model: the one picked in Build mode, else
  // what this composer resolves without the Plan model. A started thread keeps its provider.
  const buildSelection = planFirst
    ? resolveComposerProviderSelection({
        entries: providerInstanceEntries,
        candidateInstanceIds,
        lockedProvider,
        lockedInstanceId,
      })
    : null;
  const buildBaseline = (() => {
    const entry = buildSelection?.selectedProviderEntry;
    if (!buildSelection || !entry) return null;
    const state = deriveEffectiveComposerModelState({
      draft: draftModelState,
      providers: providerStatuses,
      selectedProvider: entry.driverKind,
      selectedInstanceId: entry.instanceId,
      requestedInstanceId: buildSelection.requestedInstanceId,
      threadModelSelection,
      projectModelSelection,
      settings,
    });
    const options = state.modelOptions?.[entry.instanceId];
    return {
      instanceId: entry.instanceId,
      model: state.selectedModel,
      ...(options ? { options } : {}),
    } satisfies ModelSelection;
  })();
  const buildModelFitsThread =
    buildModel !== null &&
    resolveComposerProviderSelection({
      entries: providerInstanceEntries,
      candidateInstanceIds: [buildModel.instanceId],
      lockedProvider,
      lockedInstanceId,
    }).selectedProviderEntry?.instanceId === buildModel.instanceId;
  return {
    implementNeedsNewThread: planFirst && buildModel !== null && !buildModelFitsThread,
    implementModelSelection: planFirst
      ? ((buildModelFitsThread ? buildModel : null) ?? buildBaseline)
      : null,
    newThreadImplementModelSelection: planFirst ? (buildModel ?? buildBaseline) : null,
    providerInstanceEntries,
    ...selection,
    selectedInstanceId,
    selectedProvider,
    selectedProviderModels,
    composerModelOptions: modelState.modelOptions,
    selectedModel: modelState.selectedModel,
    composerProviderState,
  };
}
