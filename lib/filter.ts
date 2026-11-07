// 거르기: 배제 단어가 있으면 폐기, 필수 키워드가 없으면 폐기.
import { BLACKLIST, KEYWORDS, WORD_BOUNDARY_TERMS } from "./config.ts";
import type { Article } from "./rss.ts";

export type Dropped = Article & { reason: "배제어" | "키워드없음"; detail: string };

// 제목에 단어가 들어 있는지 확인한다. 영문 약어는 다른 영문·숫자 사이에 끼면 무시한다. (예: CB가 CBS 안에 있는 경우)
export function hasTerm(text: string, term: string): boolean {
  const t = text.toLowerCase();
  const w = term.toLowerCase();
  if (!WORD_BOUNDARY_TERMS.has(term)) return t.includes(w);
  let from = 0;
  while (true) {
    const i = t.indexOf(w, from);
    if (i < 0) return false;
    const before = i === 0 ? "" : t[i - 1];
    const after = t[i + w.length] ?? "";
    if (!/[a-z0-9]/.test(before) && !/[a-z0-9]/.test(after)) return true;
    from = i + 1;
  }
}

export function findTerms(text: string, terms: string[]): string[] {
  return terms.filter((term) => hasTerm(text, term));
}

export function filterArticles(articles: Article[]): {
  passed: (Article & { keywords: string[] })[];
  dropped: Dropped[];
} {
  const passed: (Article & { keywords: string[] })[] = [];
  const dropped: Dropped[] = [];
  for (const a of articles) {
    const bad = findTerms(a.title, BLACKLIST);
    if (bad.length) {
      dropped.push({ ...a, reason: "배제어", detail: bad.join(", ") });
      continue;
    }
    const keywords = findTerms(a.title, KEYWORDS);
    if (!keywords.length) {
      dropped.push({ ...a, reason: "키워드없음", detail: "" });
      continue;
    }
    passed.push({ ...a, keywords });
  }
  return { passed, dropped };
}
