export type EventTimeFields = {
  occurredAt: string;
  receivedAt: string;
  eventId: string;
};

export const compareIsoStrings = (left: string, right: string) => left.localeCompare(right);

export const compareEventTime = <TEvent extends EventTimeFields>(left: TEvent, right: TEvent) =>
  compareIsoStrings(left.occurredAt, right.occurredAt) ||
  compareIsoStrings(left.receivedAt, right.receivedAt) ||
  compareIsoStrings(left.eventId, right.eventId);

export const minutesBetweenIso = (startIso: string, endIso: string) =>
  Math.max(0, Math.floor((new Date(endIso).getTime() - new Date(startIso).getTime()) / 60_000));

export const addMinutesIso = (iso: string, minutes: number) =>
  new Date(new Date(iso).getTime() + minutes * 60_000).toISOString();
