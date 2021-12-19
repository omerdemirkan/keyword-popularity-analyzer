import { add, differenceInDays, sub } from "date-fns";
import {
  interestOverTime,
  Options,
  GoogleTrendsTimelineData,
} from "google-trends-api";
import { GOOGLE_TRENDS_MAX_WEEKS } from "../constants";
import db from "../../db";
import { KeywordPopularity, fetchKeywordTrendOptions } from "../types";

export async function fetchKeywordTrend(
  keyword: string,
  {
    weeks = GOOGLE_TRENDS_MAX_WEEKS,
    // To better determine nWeekHigh and nWeekLow values
    // for the first keyword popularity entries
    trendWeekClearance = 104,
  }: fetchKeywordTrendOptions = {}
): Promise<KeywordPopularity[]> {
  const overlap = Math.floor(GOOGLE_TRENDS_MAX_WEEKS / 2);
  // First checking for existing entries, since we might not have to
  // ping google trends too much, or at all.

  const now = new Date();
  const startDate = sub(now, { weeks });

  const trendsCollection = db.collection("trends");
  const timelineSnapshot = await trendsCollection
    .where("keyword", "==", keyword)
    .orderBy("timestamp", "asc")
    .get();

  const existingTimeline = timelineSnapshot.docs.map(
    (doc) =>
      ({
        ...doc.data(),
        date: unixTimestampToDate(doc.get("timestamp")),
      } as KeywordPopularity)
  );
  const lastTimelineEntry = existingTimeline.length
    ? unixTimestampToDate(
        timelineSnapshot.docs[timelineSnapshot.size - 1].get("timestamp")
      )
    : null;
  const firstTimelineEntry = existingTimeline.length
    ? unixTimestampToDate(timelineSnapshot.docs[0].get("timestamp"))
    : null;
  const unzippedTimelinesPromises: Promise<KeywordPopularity[][]>[] = [];

  if (timelineSnapshot.empty) {
    unzippedTimelinesPromises.push(
      fetchUnzippedTimelines({
        keyword,
        overlap,
        startDate: sub(startDate, { weeks: trendWeekClearance }),
        endDate: now,
      })
    );
  }

  if (
    firstTimelineEntry &&
    differenceInDays(firstTimelineEntry, startDate) > 7
  ) {
    unzippedTimelinesPromises.push(
      fetchUnzippedTimelines({
        keyword,
        overlap,
        startDate: sub(startDate, { weeks: trendWeekClearance }),
        endDate: add(firstTimelineEntry, { weeks: overlap }),
      })
    );
  }

  if (lastTimelineEntry && differenceInDays(now, lastTimelineEntry) > 7) {
    unzippedTimelinesPromises.push(
      fetchUnzippedTimelines({
        keyword,
        overlap,
        startDate: sub(lastTimelineEntry, { weeks: overlap }),
        endDate: now,
      })
    );
  }

  const unzippedTimelines = [];
  if (existingTimeline.length) unzippedTimelines.push(existingTimeline);
  for (const timelines of await Promise.all(unzippedTimelinesPromises))
    unzippedTimelines.push(...timelines);

  const zippedTimeline = zipRelativeTimelines(unzippedTimelines);
  populateKeywordTrends(zippedTimeline);
  syncNewTrendTimelineWithDatabase(zippedTimeline, existingTimeline);

  const slicedTimeline = zippedTimeline.slice(zippedTimeline.length - weeks);
  const normalizedTimeline = normalizeTrendTimeline(slicedTimeline);
  return normalizedTimeline;
}

async function syncNewTrendTimelineWithDatabase(
  newTrendTimeline: KeywordPopularity[],
  existingTrendTimeline: KeywordPopularity[]
) {
  const trendsCollection = db.collection("trends");
  let batch = db.batch();
  let count = 0; // Firebase allows at most 500 operations per batch
  const existingTrendItemMap: { [key: string]: KeywordPopularity } = {};
  for (const trendData of existingTrendTimeline)
    existingTrendItemMap[getKeywordPopularityId(trendData)] = trendData;

  const promises: Promise<FirebaseFirestore.WriteResult[]>[] = [];
  for (const trendData of newTrendTimeline) {
    const id = getKeywordPopularityId(trendData);
    const docRef = trendsCollection.doc(id);

    if (!existingTrendItemMap[id]) {
      batch.create(docRef, trendData);
      count++;
    } else if (existingTrendItemMap[id]?.value !== trendData.value) {
      batch.update(docRef, { value: existingTrendItemMap[id].value });
      count++;
    }
    if (count == 400) {
      promises.push(batch.commit());
      batch = db.batch();
    }
  }
  promises.push(batch.commit());
  await Promise.all(promises);
}

async function fetchGoogleTrends(
  options: Options
): Promise<GoogleTrendsTimelineData[]> {
  const res = await interestOverTime(options);
  return JSON.parse(res).default.timelineData;
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
        nextTimeline[nextIndex].timestamp === currTimeline[currIndex].timestamp;
        nextIndex--, currIndex--
      ) {
        currSum += currTimeline[currIndex].value;
        nextSum += nextTimeline[nextIndex].value;
      }
      weight *= nextSum / currSum;
    }

    const stopTimestamp = prevTimeline
      ? prevTimeline[prevTimeline.length - 1].timestamp
      : Infinity;
    let i = currTimeline.length;
    while (i-- && currTimeline[i].timestamp !== stopTimestamp) {
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
    .sort((a, b) => a[0].timestamp - b[0].timestamp);
  const filteredTimelines: KeywordPopularity[][] = [];
  for (const timeline of sortedTimelines) {
    if (
      !filteredTimelines.length ||
      filteredTimelines[filteredTimelines.length - 1][0].timestamp !==
        timeline[0].timestamp
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

function normalizeTrendTimeline(
  timeline: KeywordPopularity[]
): KeywordPopularity[] {
  const max = timeline.reduce((acc, curr) => Math.max(acc, curr.value), 0);
  const multiplier = 100 / max;
  return timeline.map((data) => ({ ...data, value: data.value * multiplier }));
}

function getKeywordPopularityId(data: KeywordPopularity) {
  return data.keyword + "-" + data.timestamp;
}
