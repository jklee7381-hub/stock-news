import { collectArticles } from "../lib/rss.ts";
const { articles, failures } = await collectArticles();
console.log("기사 수:", articles.length);
console.log("실패:", failures);
const by: Record<string, number> = {};
for (const a of articles) by[a.source] = (by[a.source] ?? 0) + 1;
console.log(Object.entries(by).sort((a, b) => b[1] - a[1]).slice(0, 15));
for (const a of articles.slice(0, 5)) console.log(a);
