// @ts-ignore
import googleTrends from "google-trends-api";

export async function getTrends({
  keyword,
  startTime,
  endTime,
}: {
  keyword: string;
  startTime?: Date;
  endTime?: Date;
}): Promise<null> {
  const res = await googleTrends.interestOverTime({
    keyword,
    startTime,
    endTime,
  });
  return JSON.parse(res).default.timelineData;
}
