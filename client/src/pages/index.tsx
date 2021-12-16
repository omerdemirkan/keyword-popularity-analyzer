import Head from "next/head";
import LineChart, {
  LineChartHeader,
  LineChartHeaderSkeleton,
  LineChartSkeleton,
} from "../components/ui/LineChart";
import { ChartPoint, Subscription } from "../utils/types";
import { useEffect, useState } from "react";
import {
  fetchCryptoChart,
  fetchKeywordPopularityChart,
  decodeCachedChartPoints,
  sendWelcomeEmail,
} from "../utils/services";
import { getDisplayPrice, emailRegex } from "../utils/helpers";
import { createSubscription } from "../utils/services/subscription.services";
import HeroAnimation from "../components/animations/HeroAnimation";
import Layout from "../components/layout/Layout";
import Divider from "../components/ui/Divider";
import Container from "../components/layout/Container";
import { format } from "date-fns";
import { localStorageCache } from "../utils/helpers/cache.helpers";
import { useRouter } from "next/router";
import NavLink from "../components/util/NavLink";

const WEEKS = 416;
const SEARCH_TERM = "bitcoin price";
const cacheRevalidationMs = 1000 * 60 * 60 * 12; // 12 hours

const fetchKeywordPopularityChartCached = localStorageCache(
  fetchKeywordPopularityChart,
  "fetchKeywordPopularityChart",
  cacheRevalidationMs
);
const fetchCryptoChartCached = localStorageCache(
  fetchCryptoChart,
  "fetchCryptoChart",
  cacheRevalidationMs
);

export default function Home() {
  const [priceChart, setPriceChart] = useState<ChartPoint[]>([]);
  const [popularityChart, setPopularityChart] = useState<ChartPoint[]>([]);
  const [isSubscribing, setIsSubscribing] = useState<boolean>(false);
  const router = useRouter();

  useEffect(function () {
    initPopularityChart();
    initPriceChart();
  }, []);

  async function initPopularityChart() {
    const popularityChart = decodeCachedChartPoints(
      await fetchKeywordPopularityChartCached(SEARCH_TERM, WEEKS)
    );
    setPopularityChart(popularityChart);
  }

  async function initPriceChart() {
    const chartPoints = decodeCachedChartPoints(
      await fetchCryptoChartCached("bitcoin", "usd", WEEKS * 7)
    );
    setPriceChart(chartPoints);
  }

  async function handleSubscribe(subscription: Subscription) {
    if (isSubscribing) return;
    setIsSubscribing(true);
    try {
      await createSubscription(subscription);
      sendWelcomeEmail(subscription.email);
      localStorage.setItem("subscription", JSON.stringify(subscription));

      router.push("/subscription");
    } catch (e) {
      alert(
        "Couldn't subscribe; please try again later. If this persists, please report this bug."
      );
      setIsSubscribing(false);
    }
  }

  return (
    <Layout>
      <Head>
        <title>Remind Me About Bitcoin</title>
      </Head>
      <Container>
        <div className="flex pb-12 lg:flex-row flex-col flex-wrap justify-between align-center">
          <section
            className="flex flex-col justify-center self-center my-12 max-w-full"
            aria-describedby="Intro Section"
          >
            <h1 className="text-4xl font-semibold mb-4 text-font-primary">
              Wake up for the next <br />
              <span className="text-primary-700">crypto winter</span>.
            </h1>
            <p className="text-lg font-light text-font-secondary mb-10">
              Get notified automatically when bitcoin leaves headlines.
            </p>
            <EmailCapture
              onSubmit={(email) => handleSubscribe({ email })}
              isSubmitting={isSubscribing}
            />
            <p className="text-sm mt-5 text-font-secondary font-light">
              No selling emails. No newsletter. Fully{" "}
              <NavLink
                href="https://github.com/omerdemirkan/remind-me-about-bitcoin"
                newTab
              >
                <span className="underline">open source</span>
              </NavLink>
              .
            </p>
          </section>
          <div className="my-12 self-center max-w-full">
            <HeroAnimation />
          </div>
        </div>
        <div className="mb-20 mt-12">
          {priceChart.length ? (
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
          ) : (
            <>
              <LineChartHeaderSkeleton />
              <LineChartSkeleton />
            </>
          )}
        </div>
        <div className="mb-36">
          {popularityChart.length ? (
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
          ) : (
            <>
              <LineChartHeaderSkeleton />
              <LineChartSkeleton />
            </>
          )}
        </div>
      </Container>
    </Layout>
  );
}

interface EmailCaptureProps {
  onSubmit(email: string): any;
  isSubmitting?: boolean;
}

const EmailCapture: React.FC<EmailCaptureProps> = ({
  onSubmit,
  isSubmitting,
}) => {
  const [email, setEmail] = useState("");
  function handleClick() {
    onSubmit(email);
  }

  return (
    <div className="py-2 bg-white shadow-faint flex">
      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="h-10 pl-6 outline-none md:text-lg text-font-secondary flex-grow bg-transparent min-w-0"
        placeholder="Email"
      />
      <Divider vertical />
      <button
        onClick={handleClick}
        className={`${
          isSubmitting ? "text-gray-400" : "text-primary-700"
        } text-lg font-semibold px-6 bg-transparent`}
        disabled={!emailRegex.test(email) || isSubmitting}
      >
        Submit
      </button>
    </div>
  );
};
