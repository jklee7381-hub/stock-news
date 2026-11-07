// 점수: 영향도 35 + 매체 신뢰도 30 + 다수 매체 20 + 최신성 15 = 100
import {
  IMPACT_RULES, MULTI_MIN_SOURCES, MULTI_SCORE, RECENCY_RULES, TRUST_MID, TRUST_SCORE, TRUST_TOP,
} from "./config.ts";
import { filterArticles, findTerms, type Dropped } from "./filter.ts";
import { isGoogleNewsLink } from "./gnews.ts";
import type { Article } from "./rss.ts";
import { urgentReason } from "./urgent.ts";

export type ScoreParts = { impact: number; trust: number; multi: number; recency: number; total: number };
export type Scored = Article & {
  keywords: string[];
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

// 같은 소식(제목이 거의 같은 기사)을 하나로 묶는 열쇠
function titleKey(title: string): string {
  return title.toLowerCase().replace(/\[[^\]]*\]|\([^)]*\)/g, "").replace(/[^0-9a-z가-힣]/g, "").slice(0, 24);
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
      score: { impact: impact.score, trust, multi, recency, total: impact.score + trust + multi + recency },
      impactLabel: impact.label,
      urgent: reason !== null,
      urgentReason: reason,
      sourceCount: 1,
    };
  });

  // 같은 소식은 점수가 가장 높은 한 건만 남기고 매체 수를 기록한다
  const groups = new Map<string, Scored>();
  for (const s of scored) {
    const key = titleKey(s.title);
    const cur = groups.get(key);
    if (!cur) { groups.set(key, s); continue; }
    const winner = s.score.total > cur.score.total ? s : cur;
    const other = winner === s ? cur : s;
    // 구글뉴스를 거치는 링크보다 언론사 원문 링크를 우선한다 (본문을 바로 읽을 수 있다)
    const link = isGoogleNewsLink(winner.link) && !isGoogleNewsLink(other.link) ? other.link : winner.link;
    groups.set(key, { ...winner, link, sourceCount: cur.sourceCount + 1, urgent: cur.urgent || s.urgent, urgentReason: cur.urgentReason ?? s.urgentReason });
  }

  const items = [...groups.values()].sort(
    (a, b) => b.score.total - a.score.total || Date.parse(b.publishedAt) - Date.parse(a.publishedAt),
  );
  return { items, dropped };
}
