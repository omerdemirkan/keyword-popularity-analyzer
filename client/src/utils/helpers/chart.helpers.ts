import { ChartPoint } from "../types";

export function getPointExtremes(points: ChartPoint[]): {
  max: number;
  min: number;
} {
  let max = Number.MIN_VALUE;
  let min = Number.MAX_VALUE;
  for (let i = 0; i < points.length; i++) {
    if (points[i].value < min) min = points[i].value;
    if (points[i].value > max) max = points[i].value;
  }
  return { min, max };
}

export function getDisplayPrice(price: number, currency: string = "$"): string {
  return `${currency}${price.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
}
