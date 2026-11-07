// 웹 화면과 /api/articles가 함께 쓰는 현재 기사 목록. 5분 동안은 같은 결과를 재사용한다.
import { cacheLife } from "next/cache";
import { processArticles, type Scored } from "./score.ts";
import type { Dropped } from "./filter.ts";
import { collectArticles } from "./rss.ts";

export type Snapshot = {
  updatedAt: string;
  total: number;
  items: Scored[];
  dropped: Dropped[];
  failures: string[];
};

export async function getSnapshot(): Promise<Snapshot> {
  "use cache";
  cacheLife({ stale: 60, revalidate: 300, expire: 900 });
  const now = new Date();
  const { articles, failures } = await collectArticles();
  // 하나도 못 가져오면 오류로 처리한다 (오류는 캐시에 남지 않는다)
  if (!articles.length) throw new Error("기사를 가져오지 못했습니다.");
  const { items, dropped } = processArticles(articles, now);
  return { updatedAt: now.toISOString(), total: articles.length, items, dropped, failures };
}
