import type {
  DataQualityFlagCreatedEvent,
  ReasonChangedEvent,
  ReasonKeptEvent,
  ReasonNoteAddedEvent,
  ReasonSelectedEvent,
} from "@/lib/events";

import {
  buildAddReasonNoteEvent,
  buildChangeReasonEvent,
  buildCorrectPreviousReasonEvent,
  buildDataQualityFlagCreatedEvent,
  buildKeepCurrentReasonEvent,
  buildSelectReasonEvent,
  type AddReasonNoteInput,
  type ChangeReasonInput,
  type DataQualityFlagInput,
  type KeepCurrentReasonInput,
  type SelectReasonInput,
} from "./workflow-event-builders";
import { appendWorkflowEvent } from "./workflow-event-store";

const appendAndReturn = <TEvent extends Parameters<typeof appendWorkflowEvent>[0]>(
  event: TEvent,
) => {
  appendWorkflowEvent(event);
  return event;
};

export const selectReason = (input: SelectReasonInput): ReasonSelectedEvent =>
  appendAndReturn(buildSelectReasonEvent(input));

export const changeReason = (input: ChangeReasonInput): ReasonChangedEvent =>
  appendAndReturn(buildChangeReasonEvent(input));

export const keepCurrentReason = (input: KeepCurrentReasonInput): ReasonKeptEvent =>
  appendAndReturn(buildKeepCurrentReasonEvent(input));

export const addReasonNote = (input: AddReasonNoteInput): ReasonNoteAddedEvent =>
  appendAndReturn(buildAddReasonNoteEvent(input));

export const correctPreviousReason = (input: ChangeReasonInput): ReasonChangedEvent =>
  appendAndReturn(buildCorrectPreviousReasonEvent(input));

export const createDataQualityFlag = (
  input: DataQualityFlagInput,
): DataQualityFlagCreatedEvent => appendAndReturn(buildDataQualityFlagCreatedEvent(input));
