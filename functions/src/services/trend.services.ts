import { differenceInWeeks, sub } from "date-fns";
import {
  interestOverTime,
  Options,
  GoogleTrendsTimelineData,
} from "google-trends-api";
import { ALERT_WEEK_BREAKPOINTS } from "../constants";
import {
  KeywordAudit,
  KeywordPopularity,
  WeekBracket,
} from "../types/trend.types";

export async function fetchGoogleTrends(
  options: Options
): Promise<GoogleTrendsTimelineData[]> {
  const res = await interestOverTime(options);
  return JSON.parse(res).default.timelineData;
}

export async function auditKeyword(
  keyword: string,
  weeks = 105
): Promise<KeywordAudit> {
  const startDate = sub(new Date(), { weeks: weeks + 1 });
  const response = await fetchGoogleTrends({ keyword, startTime: startDate });
  const timeline = response.map(mapGoogleTrendsTimelineData);
  const nWeekLow = getTimelineNWeekLow(timeline);
  const weekBracket = getWeekBracket(nWeekLow);

  return {
    keyword,
    timeline,
    nWeekLow,
    weekBracket,
  };
}

// Function that returns how many weeks back you have to go
// for the keyword to be more popular.
export function getTimelineNWeekLow(
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

function mapGoogleTrendsTimeString(timeString: string): Date {
  const unixTimeStamp = +timeString;
  const unixTimeStampInMilliseconds = unixTimeStamp * 1000;
  return new Date(unixTimeStampInMilliseconds);
}

function mapGoogleTrendsTimelineData({
  value,
  time,
}: GoogleTrendsTimelineData): KeywordPopularity {
  return {
    value: Array.isArray(value) ? value[0] : 0,
    date: mapGoogleTrendsTimeString(time),
  };
}

function getWeekBracket(nWeekLow: number): WeekBracket {
  const possibleLowerBounds = ALERT_WEEK_BREAKPOINTS.filter(
    (breakpoint) => breakpoint < nWeekLow
  );
  const lowerBound = possibleLowerBounds.length
    ? Math.min(...possibleLowerBounds)
    : 0;

  const possibleUpperBounds = ALERT_WEEK_BREAKPOINTS.filter(
    (breakpoint) => breakpoint > nWeekLow
  );
  const upperBound = possibleUpperBounds
    ? Math.min(...possibleUpperBounds)
    : Infinity;

  const weekBracket = lowerBound
    ? ([lowerBound, upperBound] as [number, number])
    : null;

  return weekBracket;
}
