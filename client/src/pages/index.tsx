import Head from "next/head";
import LineChart from "../components/ui/LineChart";
import { ChartPoint, Subscription } from "../utils/types";
import { useEffect, useState } from "react";
import { fetchCryptoChart } from "../utils/services/price.services";
import { getDisplayPrice } from "../utils/helpers";
import { fetchKeywordPopularityChart } from "../utils/services/popularity.services";
import { useForm } from "react-hook-form";
import { emailRegex } from "../utils/helpers/validation.helpers";
import { createSubscription } from "../utils/services/subscription.services";
import HeroAnimation from "../components/animations/HeroAnimation";

export default function Home() {
  const [priceChart, setPriceChart] = useState<ChartPoint[]>([]);
  const [popularityChart, setPopularityChart] = useState<ChartPoint[]>([]);
  const { register, handleSubmit } = useForm();

  useEffect(function () {
    initPopularityChart();
    initPriceChart();
  }, []);

  async function initPopularityChart() {
    setPopularityChart(await fetchKeywordPopularityChart("bitcoin price", 416));
  }

  async function initPriceChart() {
    setPriceChart(await fetchCryptoChart("bitcoin", "usd", 416 * 7));
  }

  async function handleSubscribe(subscription: Subscription) {
    await createSubscription(subscription);
  }

  return (
    <div>
      <Head>
        <title>Remind Me About Bitcoin</title>
      </Head>

      <div className="flex justify-center items-center min-h-screen">
        <HeroAnimation />
      </div>
      <div className="flex justify-center items-center max-w-5xl m-auto">
        {priceChart.length ? (
          <LineChart points={priceChart} displayValue={getDisplayPrice} />
        ) : null}
      </div>
      <div className="flex justify-center items-center max-w-5xl m-auto">
        {popularityChart.length ? <LineChart points={popularityChart} /> : null}
      </div>
      <form onSubmit={handleSubmit(handleSubscribe)}>
        <input
          {...register("email", { required: true, pattern: emailRegex })}
        />
        <button type="submit">Subscribe</button>
      </form>
    </div>
  );
}
