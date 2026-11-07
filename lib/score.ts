// 점수: 영향도 35 + 매체 신뢰도 30 + 다수 매체 20 + 최신성 15 = 100
import {
  CATEGORIES, CATEGORY_OTHER, IMPACT_RULES, MULTI_MIN_SOURCES, MULTI_SCORE, RECENCY_RULES, TRUST_MID, TRUST_SCORE, TRUST_TOP,
} from "./config.ts";
import { filterArticles, findTerms, type Dropped } from "./filter.ts";
import { isGoogleNewsLink } from "./gnews.ts";
import type { Article } from "./rss.ts";
import { urgentReason } from "./urgent.ts";

export type ScoreParts = { impact: number; trust: number; multi: number; recency: number; total: number };
export type Scored = Article & {
  keywords: string[];
  category: string;
  score: ScoreParts;
  impactLabel: string;
  urgent: boolean;
  urgentReason: string | null;
  sourceCount: number; // 같은 소식을 보도한 매체 수
};

export function impactOf(title: string): { score: number; label: string } {
  for (const rule of IMPACT_RULES) {
    if (findTerms(title, rule.terms).length) return { score: rule.score, label: rule.label };
  }
  return { score: 0, label: "" };
}

export function categoryOf(title: string): string {
  for (const c of CATEGORIES) if (findTerms(title, c.terms).length) return c.name;
  return CATEGORY_OTHER;
}

export function trustOf(source: string): number {
  const s = source.toLowerCase();
  if (TRUST_TOP.some((n) => s.includes(n.toLowerCase()))) return TRUST_SCORE.top;
  if (TRUST_MID.some((n) => s.includes(n.toLowerCase()))) return TRUST_SCORE.mid;
  return TRUST_SCORE.low;
}

export function recencyOf(publishedAt: string, now: Date): number {
  const min = (now.getTime() - Date.parse(publishedAt)) / 60000;
  for (const r of RECENCY_RULES) if (min <= r.withinMinutes) return r.score;
  return 0;
}

const STOPWORDS = new Set([
  "등", "및", "에", "의", "도", "로", "으로", "과", "와", "은", "는", "이", "가", "을", "를",
  "속", "앞두고", "가능성", "전망", "소식", "발표", "우려", "힘", "받는다", "검토", "하루",
  "만에", "관련", "관련주", "브리핑", "시황", "마감", "종합", "vs", "더", "또", "왜", "때"
]);

// 기사 제목에서 핵심 단어 토큰들을 뽑아낸다
export function extractTitleTokens(title: string): Set<string> {
  const cleaned = title
    .replace(/\[[^\]]*\]|\([^)]*\)|<[^>]*>|【[^】]*】/g, " ")
    .replace(/['"‘’“”·…:|\-~]/g, " ")
    .toLowerCase();

  const words = cleaned.match(/[0-9a-z가-힣]+/g) ?? [];
  const tokens = new Set<string>();
  for (const w of words) {
    if (w.length >= 2 && !STOPWORDS.has(w)) {
      tokens.add(w);
    }
  }
  return tokens;
}

// 두 기사가 실질적으로 같은 소식을 다루고 있는지 판정
export function isSameStory(a: { title: string; publishedAt: string }, b: { title: string; publishedAt: string }): boolean {
  // 1. 발행 시각이 36시간 이상 차이나면 다른 소식으로 본다
  const diffHours = Math.abs(Date.parse(a.publishedAt) - Date.parse(b.publishedAt)) / 3600000;
  if (!Number.isNaN(diffHours) && diffHours > 36) return false;

  // 2. 제목의 특수문자 제거 후 상호 포함 관계
  const cleanA = a.title.replace(/\[[^\]]*\]|\([^)]*\)/g, "").replace(/[^0-9a-z가-힣]/gi, "").toLowerCase();
  const cleanB = b.title.replace(/\[[^\]]*\]|\([^)]*\)/g, "").replace(/[^0-9a-z가-힣]/gi, "").toLowerCase();
  if (cleanA.length >= 10 && cleanB.length >= 10 && (cleanA.includes(cleanB) || cleanB.includes(cleanA))) return true;

  // 3. 핵심 단어 유사도 판정
  const tokensA = extractTitleTokens(a.title);
  const tokensB = extractTitleTokens(b.title);
  if (tokensA.size === 0 || tokensB.size === 0) return false;

  let interCount = 0;
  for (const t of tokensA) {
    if (tokensB.has(t)) interCount++;
  }
  if (interCount === 0) return false;

  const minSize = Math.min(tokensA.size, tokensB.size);
  const unionSize = tokensA.size + tokensB.size - interCount;
  const overlap = interCount / minSize;
  const jaccard = interCount / unionSize;

  // 겹치는 핵심 단어가 3개 이상이거나, 최소 단어 집합의 50% 이상 일치, 또는 자카드 0.35 이상
  return interCount >= 3 || (interCount >= 2 && overlap >= 0.5) || jaccard >= 0.35;
}

export function processArticles(articles: Article[], now: Date = new Date()): { items: Scored[]; dropped: Dropped[] } {
  const { passed, dropped } = filterArticles(articles);

  // 키워드별로 서로 다른 매체가 몇 곳인지 센다 (다수 매체 동시 보도 점수)
  const sourcesByKeyword = new Map<string, Set<string>>();
  for (const a of passed) {
    for (const k of a.keywords) {
      if (!sourcesByKeyword.has(k)) sourcesByKeyword.set(k, new Set());
      sourcesByKeyword.get(k)!.add(a.source);
    }
  }

  const scored: Scored[] = passed.map((a) => {
    const impact = impactOf(a.title);
    const trust = trustOf(a.source);
    const multi = a.keywords.some((k) => (sourcesByKeyword.get(k)?.size ?? 0) >= MULTI_MIN_SOURCES) ? MULTI_SCORE : 0;
    const recency = recencyOf(a.publishedAt, now);
    const reason = urgentReason(a.title, a.publishedAt, now);
    return {
      ...a,
      category: categoryOf(a.title),
      score: { impact: impact.score, trust, multi, recency, total: impact.score + trust + multi + recency },
      impactLabel: impact.label,
      urgent: reason !== null,
      urgentReason: reason,
      sourceCount: 1,
    };
  });

  // 점수가 높은 순으로 정렬한 뒤, 이미 등록된 같은 소식 클러스터와 비교하여 병합한다
  const sorted = [...scored].sort(
    (a, b) => b.score.total - a.score.total || Date.parse(b.publishedAt) - Date.parse(a.publishedAt),
  );

  const clustered: Scored[] = [];
  for (const s of sorted) {
    const existing = clustered.find((c) => isSameStory(c, s));
    if (!existing) {
      clustered.push({ ...s });
    } else {
      // 이미 더 높은 점수의 기사가 대표로 등록되어 있으므로 매체 수만 누적하고 링크를 개선한다
      existing.sourceCount += 1;
      existing.urgent = existing.urgent || s.urgent;
      existing.urgentReason = existing.urgentReason ?? s.urgentReason;
      if (isGoogleNewsLink(existing.link) && !isGoogleNewsLink(s.link)) {
        existing.link = s.link; // 구글뉴스 우회 링크보다 언론사 원문 링크 선호
      }
    }
  }

  return { items: clustered, dropped };
}
