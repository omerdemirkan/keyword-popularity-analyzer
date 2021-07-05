declare module "google-trends-api" {
  export interface Options {
    keyword: string | string[];
    startTime?: Date;
    endTime?: Date;
    geo?: string | string[];
    hl?: string;
    timezone?: number;
    category?: number;
    property?: "images" | "news" | "youtube" | "froogle";
    resolution?: "COUNTRY" | "REGION" | "CITY" | "DMA";
    granularTimeResolution?: boolean;
  }
  export function interestOverTime(options: Options): Promise<string>;

  export interface TimelineData {
    placeholder: boolean;
  }
}
