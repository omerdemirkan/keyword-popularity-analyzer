import { differenceInWeeks, isSameISOWeek, sub } from "date-fns";
import {
  interestOverTime,
  Options,
  GoogleTrendsTimelineData,
} from "google-trends-api";
import { GOOGLE_TRENDS_MAX_WEEKS, WEEKS_IN_A_DECADE } from "../constants";
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

export async function fetchKeywordPopularityTimeline(
  keyword: string,
  {
    weeks = GOOGLE_TRENDS_MAX_WEEKS,
  }: FetchKeywordPopularityTimelineOptions = {}
): Promise<KeywordPopularity[]> {
  if (weeks <= 0)
    throw new Error(
      "fetchKeywordPopularityTimeline expected a positive integer for weeks."
    );

  weeks = Math.floor(weeks);

  // Since Google trends results are relative, and
  // are limited in scope (time), we can fetch individual,
  // overlapping sections and zip a final result together
  const overlap = Math.floor(GOOGLE_TRENDS_MAX_WEEKS / 2);
  const unzippedTimelines = await fetchUnzippedTimelines({
    keyword,
    overlap,
    weeks,
  });

  // [50, 100], [50, 100], [50, 100] -> [12.5, 25, 50, 100]
  const zippedTimeline = zipRelativeTimelines(unzippedTimelines);

  // Zipping results into one timeline
  return zippedTimeline.slice(zippedTimeline.length - weeks);
}

// fetchKeywordPopularityTimeline("bitcoin", { weeks: 260 }).then(console.log);

async function fetchUnzippedTimelines({
  weeks,
  overlap,
  keyword,
}: {
  weeks: number;
  overlap: number;
  keyword: string;
}): Promise<KeywordPopularity[][]> {
  const promises: Promise<GoogleTrendsTimelineData[]>[] = [];
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
  return unzippedTimelines;
}

// Combining a bunch of overlapping relative timeline
// into one timeline.
function zipRelativeTimelines(
  unzippedTimelines: KeywordPopularity[][]
): KeywordPopularity[] {
  // Sorting and filtering subset timelines.
  unzippedTimelines = getSortedAndFilteredUnzippedTimelines(unzippedTimelines);
  const zippedTimeline: KeywordPopularity[] = [];
  let weight = 1;
  let nextTimelineEndIndex = -1;
  for (
    let timelineIndex = unzippedTimelines.length - 1;
    timelineIndex >= 0;
    timelineIndex--
  ) {
    const prevTimeline =
      timelineIndex > 0 ? unzippedTimelines[timelineIndex - 1] : null;
    const currTimeline = unzippedTimelines[timelineIndex];
    const nextTimeline =
      timelineIndex < unzippedTimelines.length - 1
        ? unzippedTimelines[timelineIndex + 1]
        : null;

    if (nextTimeline) {
      // Setting current iteration's weight
      // based on previous weight and overlapping area's sums
      let currSum = 0;
      let nextSum = 0;
      for (
        let nextIndex = nextTimelineEndIndex,
          currIndex = currTimeline.length - 1;
        nextIndex >= 0 &&
        isSameISOWeek(
          nextTimeline[nextIndex].date,
          currTimeline[currIndex].date
        );
        nextIndex--, currIndex--
      ) {
        currSum += currTimeline[currIndex].value;
        nextSum += nextTimeline[nextIndex].value;
      }
      weight *= nextSum / currSum;
    }

    const stopDate = prevTimeline
      ? prevTimeline[prevTimeline.length - 1].date
      : new Date(0);
    let i = currTimeline.length;
    while (i-- && !isSameISOWeek(currTimeline[i].date, stopDate)) {
      zippedTimeline.push({
        ...currTimeline[i],
        value: weight * currTimeline[i].value,
      });
    }

    if (i === -1) break;

    nextTimelineEndIndex = i;
  }
  zippedTimeline.reverse();
  return zippedTimeline;
}

function getSortedAndFilteredUnzippedTimelines(
  unzippedTimelines: KeywordPopularity[][]
): KeywordPopularity[][] {
  const sortedTimelines = [...unzippedTimelines].sort(
    (a, b) => a[0].date.getTime() - b[0].date.getTime()
  );
  const filteredTimelines: KeywordPopularity[][] = [];
  for (const timeline of sortedTimelines) {
    if (
      !filteredTimelines.length ||
      filteredTimelines[filteredTimelines.length - 1][0].date.getTime() !==
        timeline[0].date.getTime()
    )
      filteredTimelines.push(timeline);
    else if (
      timeline.length > filteredTimelines[filteredTimelines.length - 1].length
    )
      filteredTimelines[filteredTimelines.length - 1] = timeline;
  }
  return filteredTimelines;
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

export async function auditKeywordHistory(
  keyword: string,
  weeks: number = WEEKS_IN_A_DECADE
): Promise<KeywordAudit> {
  const timeline = await fetchKeywordPopularityTimeline(keyword, {
    weeks: weeks + 104,
  });
  for (let i = 0; i < timeline.length; i++) {
    timeline[i].nWeekLow = traceBackNWeekLow(timeline, i);
  }
  const trimmedTimeline = timeline.slice(timeline.length - weeks);
  return {
    keyword,
    // Getting current nWeekLow
    nWeekLow: trimmedTimeline[trimmedTimeline.length - 1].nWeekLow as number,
    timeline: trimmedTimeline,
  };
}

// Function that returns how many weeks back you have to go
// for the keyword to be more popular.
export function traceBackNWeekLow(
  timeline: KeywordPopularity[],
  from?: number
): number {
  if (from && (from < 0 || from >= timeline.length))
    throw new Error("Invalid from index");

  const endIndex = from || timeline.length - 1;
  let startIndex: number;
  for (startIndex = endIndex - 1; startIndex >= 0; startIndex--) {
    if (timeline[startIndex].value < timeline[endIndex].value) break;
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
