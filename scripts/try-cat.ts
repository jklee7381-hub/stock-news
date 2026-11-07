import { collectArticles } from "../lib/rss.ts";
import { processArticles } from "../lib/score.ts";
const { articles } = await collectArticles();
const { items } = processArticles(articles);
const by: Record<string, string[]> = {};
for (const i of items) (by[i.category] ??= []).push(i.title);
for (const [c, t] of Object.entries(by)) { console.log(`\n## ${c} (${t.length})`); for (const x of t.slice(0, 6)) console.log("  -", x.slice(0, 60)); }
