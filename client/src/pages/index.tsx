import Head from "next/head";
import LineChart, { LineChartHeader } from "../components/ui/LineChart";
import { ChartPoint, Subscription } from "../utils/types";
import { useEffect, useState } from "react";
import { fetchCryptoChart } from "../utils/services/price.services";
import { getDisplayPrice, emailRegex } from "../utils/helpers";
import { fetchKeywordPopularityChart } from "../utils/services/popularity.services";
import { createSubscription } from "../utils/services/subscription.services";
import HeroAnimation from "../components/animations/HeroAnimation";
import Layout from "../components/layout/Layout";
import Divider from "../components/ui/Divider";
import Container from "../components/layout/Container";
import { format } from "date-fns";
import { auditKeyword } from "../utils/services";
import { localStorageCache } from "../utils/helpers/cache.helpers";

const WEEKS = 416;
const SEARCH_TERM = "bitcoin price";

const auditKeywordCached = localStorageCache(
  auditKeyword,
  "auditKeyword",
  1000 * 60 * 60
);
const fetchCryptoChartCached = localStorageCache(
  fetchCryptoChart,
  "fetchCryptoChart",
  1000 * 60 * 60
);

export default function Home() {
  const [priceChart, setPriceChart] = useState<ChartPoint[]>([]);
  const [popularityChart, setPopularityChart] = useState<ChartPoint[]>([]);

  useEffect(function () {
    initPopularityChart();
    initPriceChart();
  }, []);

  async function initPopularityChart() {
    const popularityChart = (await auditKeywordCached(SEARCH_TERM, WEEKS))
      .timeline;
    setPopularityChart(popularityChart);
  }

  async function initPriceChart() {
    setPriceChart(await fetchCryptoChartCached("bitcoin", "usd", WEEKS * 7));
  }

  async function handleSubscribe(subscription: Subscription) {
    await createSubscription(subscription);
  }

  return (
    <Layout
      scrollView={
        <Container>
          {priceChart.length ? (
            <div className="mb-14">
              <LineChart
                points={priceChart}
                renderHeader={({ value, date }) => (
                  <LineChartHeader
                    header={getDisplayPrice(value)}
                    subheader={`BTC / USD, ${format(
                      date,
                      "MMM d, yyyy"
                    ).toUpperCase()}`}
                  />
                )}
              />
            </div>
          ) : null}
          {/* {priceChart.length ? (
            <div className="mb-36">
              <LineChart
                points={priceChart}
                renderHeader={({ value, date }) => (
                  <LineChartHeader
                    header={getDisplayPrice(value)}
                    subheader={`BTC / USD, ${format(
                      date,
                      "MMM d, yyyy"
                    ).toUpperCase()}`}
                  />
                )}
              />
            </div>
          ) : null} */}
          {popularityChart.length ? (
            <div className="mb-36">
              <LineChart
                points={popularityChart}
                renderHeader={({ value, date }) => (
                  <LineChartHeader
                    header={`${Math.round(value)}% of ${Math.round(
                      WEEKS / 52
                    )}-year max`}
                    subheader={`"${SEARCH_TERM.toUpperCase()}" SEARCHES, ${format(
                      date,
                      "MMM d, yyyy"
                    ).toUpperCase()}`}
                  />
                )}
              />
            </div>
          ) : null}
        </Container>
      }
    >
      <Head>
        <title>Remind Me About Bitcoin</title>
      </Head>
      <Container>
        <div className="flex flex-wrap justify-between align-center">
          <section
            className="flex flex-col justify-center self-center"
            aria-describedby="Intro Section"
          >
            <h1 className="text-4xl font-semibold mb-4 text-font-primary">
              Wake up for the next <br />
              <span className="text-primary-700">crypto winter</span>.
            </h1>
            <p className="text-lg font-light text-font-secondary mb-10">
              Get notified automatically when bitcoin leaves headlines.
            </p>
            <EmailCapture onSubmit={(email) => handleSubscribe({ email })} />
            <p className="text-sm mt-5 text-font-secondary font-light">
              No selling emails. No newsletter. No bullsh*t.
            </p>
          </section>
          <div className="mt-12 self-center">
            <HeroAnimation />
          </div>
        </div>
      </Container>
    </Layout>
  );
}

interface EmailCaptureProps {
  onSubmit(email: string): any;
}

const EmailCapture: React.FC<EmailCaptureProps> = ({ onSubmit }) => {
  const [email, setEmail] = useState("");
  function handleClick() {
    onSubmit(email);
  }

  return (
    <div className="py-2 bg-white shadow-faint flex">
      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="h-10 pl-6 outline-none text-lg text-font-secondary flex-grow bg-transparent"
        placeholder="Email"
      />
      <Divider vertical />
      <button
        onClick={handleClick}
        className="text-primary-700 text-lg font-semibold px-6 bg-transparent"
        disabled={!emailRegex.test(email)}
      >
        Submit
      </button>
    </div>
  );
};
