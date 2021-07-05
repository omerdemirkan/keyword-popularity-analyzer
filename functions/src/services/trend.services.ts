import { interestOverTime, Options, TimelineData } from "google-trends-api";

export async function fetchTrends(options: Options): Promise<TimelineData> {
  const res = await interestOverTime(options);
  return JSON.parse(res).default.timelineData;
}
