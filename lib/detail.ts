// 기사 한 건의 상세: 원문 주소 해석 → 본문 추출 → 요약·용어 풀이. (모두 규칙 기반, 저장하지 않는다)
import { extractBody } from "./extract.ts";
import { findGlossary } from "./glossary.ts";
import { isGoogleNewsLink, resolveGoogleNews } from "./gnews.ts";
import type { Article } from "./rss.ts";
import { summarize } from "./summary.ts";

export const EXCERPT_CHARS = 1500; // 공개 화면에는 본문 앞부분만 보여 준다

export type Detail = {
  ok: boolean;
  reason: string; // 실패 이유 (ok가 true면 빈 문자열)
  summary: string;
  terms: { term: string; explanation: string }[];
  excerpt: string;
  truncated: boolean;
};

const fail = (reason: string, title: string): Detail => ({
  ok: false,
  reason,
  summary: "",
  terms: findGlossary(title),
  excerpt: "",
  truncated: false,
});

export async function getDetail(a: Pick<Article, "title" | "link">): Promise<Detail> {
  const url = isGoogleNewsLink(a.link) ? await resolveGoogleNews(a.link) : a.link;
  if (!url) return fail("원문 주소를 찾지 못했습니다.", a.title);

  const r = await extractBody(url, a.title);
  if (!r.ok) return fail(r.reason === "본문 없음" ? "본문을 읽지 못했습니다." : "원문에 접속하지 못했습니다.", a.title);

  const truncated = r.body.length > EXCERPT_CHARS;
  const excerpt = truncated ? r.body.slice(0, EXCERPT_CHARS).replace(/\s+\S*$/, "") + "…" : r.body;
  return {
    ok: true,
    reason: "",
    summary: summarize(r.body, a.title, a.title),
    terms: findGlossary(a.title + "\n" + r.body),
    excerpt,
    truncated,
  };
}
