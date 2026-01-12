// src/types/crawler.ts

export interface CrawlerStatusItem {
  id: number;
  boardName: string;
  lastUpdatedAt: string;
  nextUpdateAt: string;
}

export interface CrawlerStatusResponse {
  count: number;
  results: CrawlerStatusItem[];
}
