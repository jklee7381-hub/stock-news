import { collectArticles } from "../lib/rss.ts";
import { processArticles } from "../lib/score.ts";
import { getDetail } from "../lib/detail.ts";
const { articles } = await collectArticles();
const { items } = processArticles(articles);
const n = Number(process.argv[2] ?? 30);
const { isGoogleNewsLink } = await import("../lib/gnews.ts"); const direct = process.argv[3] === "direct"; const all = direct ? items.filter((i) => !isGoogleNewsLink(i.link)) : items; console.log("전체", items.length, "직접링크", items.filter((i) => !isGoogleNewsLink(i.link)).length); const pick = all.slice(0, n);
let ok = 0; const reasons: Record<string, number> = {};
const out: string[] = [];
for (const it of pick) {
  const d = await getDetail(it);
  if (d.ok) ok++; else reasons[d.reason] = (reasons[d.reason] ?? 0) + 1;
  out.push(`${d.ok ? "OK " : "실패"} [${it.source}] ${it.title.slice(0, 40)}\n   요약: ${d.summary.slice(0, 110)}\n   용어: ${d.terms.map((t) => t.term).join(", ")}\n   본문: ${d.excerpt.slice(0, 90).replace(/\n/g, " ")} (${d.excerpt.length}자)`);
}
console.log(out.join("\n"));
console.log(`\n성공 ${ok}/${pick.length}`, reasons);
