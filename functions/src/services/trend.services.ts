import { sub } from "date-fns";
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

export async function fetchKeywordPopularityTimeline(
  keyword: string,
  {
    weeks = GOOGLE_TRENDS_MAX_WEEKS,
    // Buffer of extra weeks of popularity to
    // more accurately determine popularity lows and highs.
    trendWeekClearance = 104,
  }: FetchKeywordPopularityTimelineOptions = {}
): Promise<KeywordPopularity[]> {
  if (weeks <= 0 || trendWeekClearance < 0)
    throw new Error(
      "invalid options passed into fetchKeywordPopularityTimeline"
    );

  weeks = Math.floor(weeks);

  // Since Google trends results are relative, and
  // are limited in time (for weekly increments), we can fetch individual,
  // overlapping sections and zip a final result together
  const overlap = Math.floor(GOOGLE_TRENDS_MAX_WEEKS / 2);
  const unzippedTimelines = await fetchUnzippedTimelines({
    keyword,
    overlap,
    weeks: weeks + trendWeekClearance,
  });
  const zippedTimeline = zipRelativeTimelines(unzippedTimelines);
  populateKeywordTrends(zippedTimeline);
  return zippedTimeline.slice(zippedTimeline.length - weeks);
}

export async function auditKeyword(
  keyword: string,
  weeks = GOOGLE_TRENDS_MAX_WEEKS
): Promise<KeywordAudit> {
  const timeline = await fetchKeywordPopularityTimeline(keyword, {
    weeks: weeks,
    trendWeekClearance: 104,
  });
  const trimmedTimeline = timeline.slice(timeline.length - weeks);
  const latestPopularity = trimmedTimeline[trimmedTimeline.length - 1];
  return {
    keyword,
    nWeekLow: latestPopularity.nWeekLow as number,
    nWeekHigh: latestPopularity.nWeekHigh as number,
    timeline: trimmedTimeline,
  };
}

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
  return unzippedTimelines.filter((timeline) => timeline.length > 0);
}

// Combining a bunch of overlapping relative timeline
// into one timeline.
function zipRelativeTimelines(
  unzippedTimelines: KeywordPopularity[][]
): KeywordPopularity[] {
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
        nextTimeline[nextIndex].date.getTime() ===
          currTimeline[currIndex].date.getTime();
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
    while (i-- && currTimeline[i].date.getTime() !== stopDate.getTime()) {
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

function populateKeywordTrends(timeline: KeywordPopularity[]): void {
  for (let i = 0; i < timeline.length; i++) {
    let j: number;

    // populating nWeekLows
    for (j = i - 1; j >= 0; j--) {
      if (timeline[j].value < timeline[i].value) break;
      j -= timeline[j].nWeekLow || 0;
    }
    timeline[i].nWeekLow = i - j - 1;

    // populating nWeekHighs
    for (j = i - 1; j >= 0; j--) {
      if (timeline[j].value > timeline[i].value) break;
      j -= timeline[j].nWeekHigh || 0;
    }
    timeline[i].nWeekHigh = i - j - 1;
  }
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
    nWeekLow: -1,
    nWeekHigh: -1,
  };
}
