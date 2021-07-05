import { differenceInWeeks, sub } from "date-fns";
import {
  interestOverTime,
  Options,
  GoogleTrendsTimelineData,
} from "google-trends-api";
import { KeywordPopularity } from "../types/popularity.types";

export async function fetchGoogleTrends(
  options: Options
): Promise<GoogleTrendsTimelineData[]> {
  const res = await interestOverTime(options);
  return JSON.parse(res).default.timelineData;
}

export async function fetchKeywordPopularity(
  keyword: string,
  weeks = 104
): Promise<KeywordPopularity[]> {
  const startDate = sub(new Date(), { weeks });
  const response = await fetchGoogleTrends({ keyword, startTime: startDate });

  return response.map(mapGoogleTrendsTimelineData);
}

// Function that returns how many weeks back you have to go
// for the keyword to be more popular.
export function nWeekLow(timeline: KeywordPopularity[], from?: number): number {
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
