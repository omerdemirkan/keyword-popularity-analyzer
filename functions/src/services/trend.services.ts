import { differenceInWeeks, sub } from "date-fns";
import {
  interestOverTime,
  Options,
  GoogleTrendsTimelineData,
} from "google-trends-api";
import { GOOGLE_TRENDS_MAX_WEEKS } from "../constants";
import { KeywordAudit, KeywordPopularity } from "../types/trend.types";

export async function fetchGoogleTrends(
  options: Options
): Promise<GoogleTrendsTimelineData[]> {
  const res = await interestOverTime(options);
  return JSON.parse(res).default.timelineData;
}

export async function auditKeyword(
  keyword: string,
  weeks = GOOGLE_TRENDS_MAX_WEEKS
): Promise<KeywordAudit> {
  const startDate = sub(new Date(), { weeks: weeks + 1 });
  const response = await fetchGoogleTrends({ keyword, startTime: startDate });
  const timeline = response.map(mapGoogleTrendsTimelineData);
  const nWeekLow = traceBackNWeekLow(timeline);

  return {
    keyword,
    timeline,
    nWeekLow,
  };
}

// Function that returns how many weeks back you have to go
// for the keyword to be more popular.
export function traceBackNWeekLow(
  timeline: KeywordPopularity[],
  from?: number
): number {
  const endIndex = from || timeline.length - 1;
  let startIndex = endIndex;
  while (startIndex--) {
    if (timeline[startIndex].value < timeline[endIndex].value) {
      break;
    }
  }
  startIndex += 1;

  return Math.abs(
    differenceInWeeks(timeline[startIndex].date, timeline[endIndex].date)
  );
}

function unixTimestampToDate(unixTimeStamp: number | string): Date {
  if (typeof unixTimeStamp === "string") unixTimeStamp = +unixTimeStamp;
  const unixTimeStampInMilliseconds = unixTimeStamp * 1000;
  return new Date(unixTimeStampInMilliseconds);
}

function mapGoogleTrendsTimelineData({
  value,
  time,
}: GoogleTrendsTimelineData): KeywordPopularity {
  return {
    value: Array.isArray(value) ? value[0] : 0,
    date: unixTimestampToDate(time),
  };
}
