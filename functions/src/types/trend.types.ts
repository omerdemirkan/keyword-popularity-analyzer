export interface KeywordPopularity {
  date: Date;
  value: number;
}

export interface KeywordAudit {
  keyword: string;
  timeline: KeywordPopularity[];
  nWeekLow: number;
}

export interface FetchKeywordPopularityTimelineOptions {
  weeks?: number;
}
