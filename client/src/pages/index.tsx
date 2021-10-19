import Head from "next/head";
import LineChart from "../components/ui/LineChart";
import { ChartPoint } from "../utils/types";
import { useEffect, useState } from "react";
import { fetchCryptoChart } from "../utils/services/price.services";
import { getDisplayPrice } from "../utils/helpers";
// import { fetchKeywordPopularityChart } from "../utils/services/popularity.services";

export default function Home() {
  const [priceChart, setPriceChart] = useState<ChartPoint[]>([]);
  // const [popularityChart, setPopularityChart] = useState<ChartPoint[]>([]);

  useEffect(function () {
    initCharts();
  }, []);

  async function initCharts() {
    setPriceChart(await fetchCryptoChart("bitcoin", "usd", 104 * 7));
    // setPopularityChart(await fetchKeywordPopularityChart("bitcoin price", 104));
  }

  return (
    <div className="flex justify-center items-center">
      <Head>
        <title>Remind Me About Bitcoin</title>
      </Head>
      {priceChart.length ? (
        <LineChart points={priceChart} displayValue={getDisplayPrice} />
      ) : null}
    </div>
  );
}
