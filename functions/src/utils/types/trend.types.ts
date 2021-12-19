export interface KeywordPopularity {
  keyword: string;
  date: Date;
  timestamp: number;
  value: number;
  nWeekLow: number;
  nWeekHigh: number;
}

export interface fetchKeywordTrendOptions {
  weeks?: number;
  trendWeekClearance?: number;
}
