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
import Layout from "../components/layout/Layout";

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
    <Layout
      scrollView={
        <>
          <div className="max-w-6xl m-auto">
            {priceChart.length ? (
              <LineChart points={priceChart} displayValue={getDisplayPrice} />
            ) : null}
            {popularityChart.length ? (
              <LineChart points={popularityChart} />
            ) : null}
          </div>
          <form onSubmit={handleSubmit(handleSubscribe)}>
            <input
              {...register("email", { required: true, pattern: emailRegex })}
            />
            <button type="submit">Subscribe</button>
          </form>
        </>
      }
    >
      <Head>
        <title>Remind Me About Bitcoin</title>
      </Head>
      <div className="max-w-6xl m-auto flex justify-between align-center">
        <section
          className="flex flex-col justify-center"
          aria-describedby="Intro Section"
        >
          <h1 className="text-4xl font-semibold mb-4">
            Wake up for the next <br />
            <span className="text-primary-700">crypto winter</span>.
          </h1>
          <p className="text-lg font-light text-font-secondary">
            Get notified automatically when bitcoin leaves headlines.
          </p>
        </section>
        <HeroAnimation />
      </div>
    </Layout>
  );
}
