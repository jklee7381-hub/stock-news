import { collectArticles } from "../lib/rss.ts";
import { processArticles } from "../lib/score.ts";
const { articles } = await collectArticles();
const { items, dropped } = processArticles(articles);
console.log(`수집 ${articles.length} → 통과 ${items.length} / 폐기 ${dropped.length}`);
console.log("폐기 이유:", dropped.reduce((m: Record<string, number>, d) => ((m[d.reason] = (m[d.reason] ?? 0) + 1), m), {}));
for (const i of items.slice(0, 12)) console.log(`${String(i.score.total).padStart(3)} ${i.urgent ? "🚨" : "  "} [${i.source}] ${i.title}`);
