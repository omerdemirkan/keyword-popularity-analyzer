const googleTrends = require("google-trends-api");

module.exports.getTrends = async function getTrends({
  keyword,
  startTime,
  endTime,
}) {
  const res = await googleTrends.interestOverTime({
    keyword,
    startTime,
    endTime,
  });
  return JSON.parse(res).default.timelineData;
};
