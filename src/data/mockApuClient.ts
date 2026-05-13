import type { ApuDataClient } from "../types";
import { getHistoricalApuRecords } from "./historicalApuRecords";
import { fetchLiveApuFeed, prototypeScenarios } from "./mockApuFeed";

export const mockApuDataClient: ApuDataClient = {
  listScenarios() {
    return prototypeScenarios;
  },

  getLiveFeed({ now = new Date(), demoMinute, scenarioId }) {
    return fetchLiveApuFeed(now, demoMinute, scenarioId);
  },

  async getHistoricalRecords({ scenarioId }) {
    return getHistoricalApuRecords(scenarioId);
  },
};
