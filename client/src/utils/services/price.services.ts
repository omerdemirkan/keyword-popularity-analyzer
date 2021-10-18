import axios from "axios";
import { ChartPoint } from "../types";

const COIN_GECKO_BASE_URL = "https://api.coingecko.com/api/v3";

export async function fetchCryptoChart(
  coinId: string = "bitcoin",
  compCurrency: string = "usd",
  days: number | "max" = "max"
): Promise<ChartPoint[]> {
  const { data } = await axios.get(
    `${COIN_GECKO_BASE_URL}/coins/${coinId}/market_chart?vs_currency=${compCurrency}&days=${days}`
  );
  // @ts-ignore
  return data.prices.map(([dateNum, price]) => ({
    value: price,
    date: new Date(dateNum),
  }));
}
