import type { StandCoordinateReferenceEvent, StandCoordinatesSnapshot } from "@/lib/events";

export type AircraftStandPosition = {
  tail: string;
  stand: string;
  bay?: string;
  apuState?: "on" | "off";
};

export type AircraftDistance = AircraftStandPosition & {
  distanceMeters: number;
};

export type StandCoordinatesInput =
  | readonly StandCoordinateReferenceEvent[]
  | StandCoordinatesSnapshot;

type StandCoordinate = {
  stand: string;
  bay: string;
  latitude: number;
  longitude: number;
};

const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

const distanceMeters = (from: StandCoordinate, to: StandCoordinate) => {
  const earthRadiusMeters = 6_371_000;
  const deltaLatitude = toRadians(to.latitude - from.latitude);
  const deltaLongitude = toRadians(to.longitude - from.longitude);
  const fromLatitude = toRadians(from.latitude);
  const toLatitude = toRadians(to.latitude);

  const haversine =
    Math.sin(deltaLatitude / 2) ** 2 +
    Math.cos(fromLatitude) * Math.cos(toLatitude) * Math.sin(deltaLongitude / 2) ** 2;

  return Math.round(
    earthRadiusMeters * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine)),
  );
};

const coordinatesFromInput = (standCoordinates: StandCoordinatesInput): StandCoordinate[] => {
  if ("stands" in standCoordinates) {
    return standCoordinates.stands;
  }

  return standCoordinates.map((event) => event.payload);
};

const coordinateMap = (standCoordinates: StandCoordinatesInput) =>
  new Map(coordinatesFromInput(standCoordinates).map((coordinate) => [coordinate.stand, coordinate]));

const withDistances = (
  target: AircraftStandPosition,
  candidates: readonly AircraftStandPosition[],
  standCoordinates: StandCoordinatesInput,
): AircraftDistance[] => {
  const coordinates = coordinateMap(standCoordinates);
  const targetCoordinate = coordinates.get(target.stand);

  if (!targetCoordinate) {
    return [];
  }

  const distances: AircraftDistance[] = [];

  for (const candidate of candidates) {
    const candidateCoordinate = coordinates.get(candidate.stand);

    if (candidate.tail === target.tail || !candidateCoordinate) {
      continue;
    }

    distances.push({
      ...candidate,
      bay: candidate.bay ?? candidateCoordinate.bay,
      distanceMeters: distanceMeters(targetCoordinate, candidateCoordinate),
    });
  }

  return distances.sort(
    (left, right) =>
      left.distanceMeters - right.distanceMeters || left.tail.localeCompare(right.tail),
  );
};

export const calculateClosestAircraft = (
  target: AircraftStandPosition,
  candidates: readonly AircraftStandPosition[],
  standCoordinates: StandCoordinatesInput,
) => withDistances(target, candidates, standCoordinates)[0];

export const calculateNearbyApuAircraft = (
  target: AircraftStandPosition,
  candidates: readonly AircraftStandPosition[],
  standCoordinates: StandCoordinatesInput,
  thresholdMeters = 100,
) =>
  withDistances(target, candidates, standCoordinates).filter(
    (candidate) => candidate.apuState === "on" && candidate.distanceMeters <= thresholdMeters,
  );
