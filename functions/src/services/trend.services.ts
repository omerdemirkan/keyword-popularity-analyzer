import { differenceInWeeks, sub } from "date-fns";
import {
  interestOverTime,
  Options,
  GoogleTrendsTimelineData,
} from "google-trends-api";
import { GOOGLE_TRENDS_MAX_WEEKS } from "../constants";
import {
  KeywordAudit,
  KeywordPopularity,
  FetchKeywordPopularityTimelineOptions,
} from "../types";

export async function fetchGoogleTrends(
  options: Options
): Promise<GoogleTrendsTimelineData[]> {
  const res = await interestOverTime(options);
  return JSON.parse(res).default.timelineData;
}

// Since Google trends results are relative, and
// are limited in scope (time), we can fetch individual,
// overlapping sections and zip a final result together
export async function fetchKeywordPopularityTimeline(
  keyword: string,
  {
    weeks = GOOGLE_TRENDS_MAX_WEEKS,
  }: FetchKeywordPopularityTimelineOptions = {}
): Promise<KeywordPopularity[]> {
  if (weeks <= 0)
    throw new Error(
      "fetchKeywordPopularityTimeline expected a positive integer for weeks"
    );

  weeks = Math.floor(weeks);

  // Fetching google trends data in chunks with overlap.
  const promises: Promise<GoogleTrendsTimelineData[]>[] = [];
  const overlap = Math.floor(GOOGLE_TRENDS_MAX_WEEKS / 2);
  let weeksAgo = 0;
  while (weeksAgo < weeks) {
    const startDate = sub(new Date(), { weeks: weeksAgo });
    const endDate = sub(new Date(), { weeks: weeksAgo + overlap * 2 });
    promises.push(
      fetchGoogleTrends({ keyword, startTime: startDate, endTime: endDate })
    );
    weeksAgo += overlap;
  }
  const googleTrendsTimelines = await Promise.all(promises);

  // Mapping and reversing results
  const unzippedTimelines: KeywordPopularity[][] = googleTrendsTimelines
    .map((googleTrendsTimelineData) =>
      googleTrendsTimelineData.map(mapGoogleTrendsTimelineData)
    )
    .reverse();

  if (unzippedTimelines.some((timeline) => timeline.length != overlap * 2))
    throw new Error("Unzipped Timelines have unexpected lengths");

  // Zipping results into one timeline
  const zippedTimeline: KeywordPopularity[] = new Array(
    overlap * unzippedTimelines.length + overlap
  ).fill(null);

  let weight = 1;
  let prevOverlapSum = 0;
  for (
    let timelineIndex = unzippedTimelines.length - 1;
    timelineIndex >= 0;
    timelineIndex--
  ) {
    const timeline = unzippedTimelines[timelineIndex];
    const zippedStartIndex = (timelineIndex + 2) * overlap - 1;
    const currOverlapSum = timeline.reduce(
      (acc, curr, i) => (i >= overlap ? acc + curr.value : acc),
      0
    );
    weight *= prevOverlapSum ? prevOverlapSum / currOverlapSum : 1;
    for (let i = 0; i < overlap; i++) {
      zippedTimeline[zippedStartIndex - i] = {
        ...timeline[timeline.length - 1 - i],
        value: timeline[i].value * weight,
      };
    }
    prevOverlapSum = currOverlapSum;
  }

  for (let i = overlap - 1; i >= 0; i--) {
    zippedTimeline[i] = {
      ...unzippedTimelines[0][i],
      value: unzippedTimelines[0][i].value * weight,
    };
  }
  return zippedTimeline.slice(zippedTimeline.length - weeks);
}

export async function auditKeyword(
  keyword: string,
  weeks = GOOGLE_TRENDS_MAX_WEEKS
): Promise<KeywordAudit> {
  const timeline = await fetchKeywordPopularityTimeline(keyword, { weeks });
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
