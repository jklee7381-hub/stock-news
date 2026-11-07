import { collectArticles } from "../lib/rss.ts";
import { isGoogleNewsLink } from "../lib/gnews.ts";
const { articles } = await collectArticles();
const a = articles.find((x) => isGoogleNewsLink(x.link) && x.source === "연합인포맥스")!;
const id = new URL(a.link).pathname.split("/").pop();
const page = await fetch(`https://news.google.com/articles/${id}?hl=ko&gl=KR&ceid=KR:ko`, { headers: { "User-Agent": "Mozilla/5.0 (compatible; stock-news-bot)" } });
const html = await page.text();
console.log("page", page.status, html.length, "sg:", /data-n-a-sg/.test(html), "ts:", /data-n-a-ts/.test(html), html.includes("consent") ? "consent페이지" : "");
console.log(html.slice(0, 200).replace(/\n/g, " "));
