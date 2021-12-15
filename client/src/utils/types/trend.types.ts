export interface KeywordPopularity {
  keyword: string;
  date: Date;
  timestamp: number;
  value: number;
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
