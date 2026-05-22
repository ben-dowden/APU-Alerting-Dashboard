export const normalizeTail = (tail: string) => tail.trim().toUpperCase();

export const createAircraftGroundEventId = (port: string, tail: string, onGroundAt: string) =>
  `${port}:${normalizeTail(tail)}:ground:${onGroundAt}`;

export const createApuEventId = (port: string, tail: string, startedAt: string) =>
  `${port}:${normalizeTail(tail)}:apu:${startedAt}`;
