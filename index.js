const { getTrends } = require("./utils/services");

(async () => {
  try {
    let startDate = new Date();
    startDate.setFullYear(startDate.getFullYear() - 2);
    const result = await getTrends({
      keyword: "bitcoin",
      startTime: startDate,
    });
    console.log(result);
  } catch (e) {
    console.log(e);
  }
})();
