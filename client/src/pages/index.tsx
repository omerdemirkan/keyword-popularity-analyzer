import Head from "next/head";
import LineChart, {
  LineChartHeader,
  LineChartHeaderSkeleton,
  LineChartSkeleton,
} from "../components/ui/LineChart";
import { ChartPoint, KeywordPopularity, Subscription } from "../utils/types";
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
import LineChartCursor from "../components/ui/LineChartCursor";
import Image from "next/image";

const WEEKS = 416;
const SEARCH_TERM = "bitcoin price";
const CACHE_REVALIDATION_MS = 1000 * 60 * 60 * 12; // 12 hours

const fetchKeywordPopularityChartCached = localStorageCache(
  fetchKeywordPopularityChart,
  "fetchKeywordPopularityChart",
  CACHE_REVALIDATION_MS
);
const fetchCryptoChartCached = localStorageCache(
  fetchCryptoChart,
  "fetchCryptoChart",
  CACHE_REVALIDATION_MS
);

export default function Home() {
  const [priceChart, setPriceChart] = useState<ChartPoint[]>([]);
  const [popularityChart, setPopularityChart] = useState<KeywordPopularity[]>(
    []
  );
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
        <div className="py-20">
          <InteractiveChart
            popularityChart={popularityChart}
            priceChart={priceChart}
          />
        </div>
        <div className="py-20 mb-20">
          <Article />
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

const Article: React.FC = () => {
  return (
    <article className="max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-font-primary mb-2">
        Is Attention an Underappreciated Bitcoin Analysis Metric: a Non-rigorous
        Exploration.
      </h2>
      <p className="text-font-secondary mb-6">December 20, 2021</p>
      <p className="text-lg text-font-secondary mb-3">
        Does it seem like frivolous dinner table discussions of cryptocurrencies
        coincide with a tremendous rally in Bitcoin? It's no coincidence.
      </p>

      <p className="text-lg text-font-secondary mb-3">
        While not a particularly groundbreaking observation, what about the
        inverse? Are there any insights we can draw about the cryptocurrency
        market from downward trends in popularity?
      </p>

      <p className="text-lg text-font-secondary mb-3">
        To explore this, I used Google Trends data for “bitcoin price”, a search
        term that may loosely represent the interest in cryptocurrencies over
        time, and marked 52+ week lows in this search term. Although{" "}
        <strong>correlation doesn't imply causation (!)</strong>, I decided to
        see price movement after these lows:
      </p>

      <div className="py-8">
        <Image
          alt="52 week low graph"
          src="/52-week-low.png"
          layout="responsive"
          objectFit="contain"
          width="100%"
          height={60}
        />
      </div>

      <p className="text-lg text-font-secondary mb-3">
        Within the last 8 years, these lows came in 4 clusters:
      </p>
      <ul className="list-disc list-inside">
        <li className="text-lg text-font-secondary">
          <strong>Cluster 1</strong>: June 6, 2015. Although any date prior to
          2017 would've been a great time to buy Bitcoin, June 6 (at $222.88)
          seems to be the bottom of the market.
        </li>
        <div className="py-8">
          <Image
            alt="First cluster of lows"
            src="/cluster-1.png"
            layout="responsive"
            objectFit="contain"
            width="100%"
            height={30}
          />
        </div>
        <li className="text-lg text-font-secondary">
          <strong>Cluster 2</strong>: Aug 25 — Nov 3, 2018. The middle of a
          sharp drop from nearly 20K to under 4K (in the 6.2-6.8K range).
        </li>
        <div className="py-8">
          <Image
            alt="Second cluster of lows"
            src="/cluster-2.png"
            layout="responsive"
            objectFit="contain"
            width="100%"
            height={30}
          />
        </div>
        <li className="text-lg text-font-secondary">
          <strong>Cluster 3</strong>: Mar 3, 2019. Near the bottom of the market
          in 2019 at $3761.
        </li>
        <div className="py-8">
          <Image
            alt="Third cluster of lows"
            src="/cluster-3.png"
            layout="responsive"
            objectFit="contain"
            width="100%"
            height={30}
          />
        </div>
        <li className="text-lg text-font-secondary">
          <strong>Cluster 4</strong>: Sep 26 — Oct 3, 2020. At around the
          10.5-11.5K price range, this precedes the most recent 2020-21 Bitcoin
          rally to highs of 66K.
        </li>
        <div className="py-8">
          <Image
            alt="Fourth cluster of lows"
            src="/cluster-4.png"
            layout="responsive"
            objectFit="contain"
            width="100%"
            height={30}
          />
        </div>
      </ul>
      <p className="text-lg text-font-secondary mb-3">
        Is this a mere coincidence or a substantive long-term buying strategy?
        As a software engineer, I haven't been able to find a conclusive answer.
        What I have done, however, is automate the tracking process for myself
        to experiment, and have made it free and open-source.
      </p>
    </article>
  );
};

interface InteractiveChartProps {
  popularityChart: KeywordPopularity[];
  priceChart: ChartPoint[];
}

const InteractiveChart: React.FC<InteractiveChartProps> = ({
  popularityChart,
  priceChart,
}) => {
  return (
    <>
      <div className="mb-20">
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
                action={
                  <p className="text-sm text-font-secondary my-2">
                    52+ week lows marked
                  </p>
                }
              />
            )}
            artifacts={
              <>
                {popularityChart.map((trendData, i) =>
                  trendData.nWeekLow > 52 ? (
                    <LineChartCursor
                      key={trendData.keyword + trendData.date}
                      points={popularityChart}
                      endDate={popularityChart[popularityChart.length - 1].date}
                      startDate={popularityChart[0].date}
                      cursorIndex={i}
                    />
                  ) : null
                )}
              </>
            }
          />
        ) : (
          <>
            <LineChartHeaderSkeleton />
            <LineChartSkeleton />
          </>
        )}
      </div>
      <div className="mt-20">
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
    </>
  );
};
