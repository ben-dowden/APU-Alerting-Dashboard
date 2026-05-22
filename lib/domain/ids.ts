export const normalizeTail = (tail: string) => tail.trim().toUpperCase();

export const createAircraftGroundEventId = (port: string, tail: string, onGroundAt: string) =>
  `${port}:${normalizeTail(tail)}:ground:${onGroundAt}`;

export const createApuEventId = (port: string, tail: string, startedAt: string) =>
  `${port}:${normalizeTail(tail)}:apu:${startedAt}`;

export type ApuEventIdentity = {
  apuEventId: string;
  tail: string;
  startedAt: string;
};

export const createLegacyFixtureApuEventId = (tail: string, startedAt: string) =>
  `apu:${normalizeTail(tail)}:${startedAt}`;

export const matchesApuEventId = (
  candidateApuEventId: string | undefined,
  apuEvent: ApuEventIdentity,
) =>
  Boolean(candidateApuEventId) &&
  (candidateApuEventId === apuEvent.apuEventId ||
    candidateApuEventId === createLegacyFixtureApuEventId(apuEvent.tail, apuEvent.startedAt));
