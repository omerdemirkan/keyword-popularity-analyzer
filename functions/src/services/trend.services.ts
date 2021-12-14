import { add, differenceInDays, differenceInWeeks, sub } from "date-fns";
import {
  interestOverTime,
  Options,
  GoogleTrendsTimelineData,
} from "google-trends-api";
import { GOOGLE_TRENDS_MAX_WEEKS } from "../constants";
import db from "../db";
import {
  KeywordAudit,
  KeywordPopularity,
  FetchKeywordPopularityTimelineOptions,
} from "../types";

export async function auditKeyword(
  keyword: string,
  weeks = GOOGLE_TRENDS_MAX_WEEKS
): Promise<KeywordAudit> {
  const timeline = await fetchKeywordPopularityTimeline(keyword, {
    weeks: weeks,
    trendWeekClearance: 104,
  });
  console.log(timeline);
  const latestPopularity = timeline[timeline.length - 1];
  return {
    keyword,
    nWeekLow: latestPopularity.nWeekLow as number,
    nWeekHigh: latestPopularity.nWeekHigh as number,
    timeline,
  };
}

async function fetchGoogleTrends(
  options: Options
): Promise<GoogleTrendsTimelineData[]> {
  console.log("fetching...");
  const res = await interestOverTime(options);
  return JSON.parse(res).default.timelineData;
}

async function fetchKeywordPopularityTimeline(
  keyword: string,
  {
    weeks = GOOGLE_TRENDS_MAX_WEEKS,
    // Buffer of extra weeks of popularity to
    // more accurately determine popularity lows and highs.
    trendWeekClearance = 104,
  }: FetchKeywordPopularityTimelineOptions = {}
): Promise<KeywordPopularity[]> {
  const overlap = Math.floor(GOOGLE_TRENDS_MAX_WEEKS / 2);
  // First checking for existing entries, since we might not have to
  // ping google trends too much, or at all.

  const now = new Date();
  const startDate = sub(now, { weeks });

  const trendsCollection = db.collection("trends");
  const timelineSnapshot = await trendsCollection
    .where("keyword", "==", keyword)
    .get();
  timelineSnapshot.docs.sort((a, b) => a.get("timestamp") - b.get("timestamp"));

  const existingTimeline = timelineSnapshot.docs.map(
    (doc) => doc.data() as KeywordPopularity
  );

  const lastTimelineEntry = !timelineSnapshot.empty
    ? new Date(
        timelineSnapshot.docs[timelineSnapshot.size - 1].get("timestamp") * 1000
      )
    : null;
  const firstTimelineEntry = !timelineSnapshot.empty
    ? new Date(timelineSnapshot.docs[0].get("timestamp") * 1000)
    : null;
  if (
    lastTimelineEntry &&
    differenceInWeeks(now, lastTimelineEntry) < 7 &&
    firstTimelineEntry &&
    differenceInWeeks(firstTimelineEntry, startDate) < 7
  )
    return existingTimeline;
  const unzippedTimelines: KeywordPopularity[][] = [];

  if (timelineSnapshot.empty) {
    unzippedTimelines.push(
      ...(await fetchUnzippedTimelines({
        keyword,
        overlap,
        startDate: sub(startDate, { weeks: trendWeekClearance }),
        endDate: now,
      }))
    );
  }

  if (
    firstTimelineEntry &&
    differenceInDays(firstTimelineEntry, startDate) > 7
  ) {
    unzippedTimelines.push(
      ...(await fetchUnzippedTimelines({
        keyword,
        overlap,
        startDate: sub(startDate, { weeks: trendWeekClearance }),
        endDate: add(firstTimelineEntry, { weeks: overlap }),
      }))
    );
  }

  if (existingTimeline.length) unzippedTimelines.push(existingTimeline);

  if (lastTimelineEntry && differenceInWeeks(now, lastTimelineEntry) > 7) {
    unzippedTimelines.push(
      ...(await fetchUnzippedTimelines({
        keyword,
        overlap,
        startDate: sub(lastTimelineEntry, { weeks: overlap }),
        endDate: now,
      }))
    );
  }

  const zippedTimeline = zipRelativeTimelines(unzippedTimelines);
  populateKeywordTrends(zippedTimeline);

  let batch = db.batch();
  let count = 0; // Firebase allows at most 500 operations per batch
  const docIdSet = new Set(timelineSnapshot.docs.map((doc) => doc.id));
  for (const trendData of zippedTimeline) {
    const id = trendData.keyword + "-" + trendData.timestamp;
    if (docIdSet.has(id)) batch.update(trendsCollection.doc(id), trendData);
    else batch.create(trendsCollection.doc(id), trendData);
    count++;
    if (count == 400) {
      batch.commit();
      batch = db.batch();
    }
  }
  batch.commit();
  return zippedTimeline.slice(zippedTimeline.length - weeks);
}

async function fetchUnzippedTimelines({
  startDate,
  endDate,
  overlap,
  keyword,
}: {
  startDate: Date;
  endDate: Date;
  overlap: number;
  keyword: string;
}): Promise<KeywordPopularity[][]> {
  const promises: Promise<GoogleTrendsTimelineData[]>[] = [];
  let currMs = startDate.getTime();
  const endMs = endDate.getTime();
  const overlapMs = 1000 * 60 * 60 * 24 * 7 * overlap;
  while (currMs < endMs) {
    promises.push(
      fetchGoogleTrends({
        keyword,
        startTime: new Date(currMs),
        endTime: new Date(currMs + 2 * overlapMs),
      })
    );
    currMs += overlapMs;
  }
  const googleTrendsTimelines = await Promise.all(promises);

  // Mapping and reversing results
  const unzippedTimelines: KeywordPopularity[][] = googleTrendsTimelines
    .map((googleTrendsTimelineData) =>
      mapGoogleTrendsTimeline(keyword, googleTrendsTimelineData)
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
  if (unzippedTimelines.length < 2) return unzippedTimelines[0];

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
  const sortedTimelines = unzippedTimelines
    .filter((timeline) => timeline.length)
    .sort((a, b) => a[0].date.getTime() - b[0].date.getTime());
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

function mapGoogleTrendsTimeline(
  keyword: string,
  timeline: GoogleTrendsTimelineData[]
): KeywordPopularity[] {
  return timeline.map(({ value, time }) => ({
    value: Array.isArray(value) ? value[0] : 0,
    date: unixTimestampToDate(time),
    timestamp: +time,
    nWeekLow: -1,
    nWeekHigh: -1,
    keyword,
  }));
}
