export interface KeywordPopularity {
  date: Date;
  value: number;
}

export type WeekBracket = [number, number] | null;

export interface KeywordAudit {
  keyword: string;
  timeline: KeywordPopularity[];
  nWeekLow: number;
  weekBracket: WeekBracket;
}
