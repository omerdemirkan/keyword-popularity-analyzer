const googleTrends = require("google-trends-api");

async function getTrends({ keyword, startTime, endTime }) {
  const res = await googleTrends.interestOverTime({
    keyword,
    startTime,
    endTime,
  });
  return JSON.parse(res).default.timelineData;
}

(async () => {
  try {
    let startDate = new Date();
    startDate.setFullYear(startDate.getFullYear() - 2);
    const result = await getTrends({
      keyword: "bitcoin",
      startTime: startDate,
    });
    console.log(result.map((data) => new Date(data.timelineAxisTime)));
  } catch (e) {
    console.log(e);
  }
})();
