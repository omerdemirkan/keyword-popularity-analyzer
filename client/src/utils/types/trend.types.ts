import { ChartPoint } from "./chart.types";

export interface KeywordPopularity extends ChartPoint {
  keyword: string;
  timestamp: number;
  nWeekLow: number;
  nWeekHigh: number;
}

export interface KeywordAudit {
  keyword: string;
  timeline: KeywordPopularity[];
  nWeekLow: number;
  nWeekHigh: number;
}

export interface fetchKeywordTrendOptions {
  weeks?: number;
  trendWeekClearance?: number;
}
