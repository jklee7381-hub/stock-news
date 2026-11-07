import { collectArticles } from "../lib/rss.ts";
import { resolveGoogleNews, isGoogleNewsLink } from "../lib/gnews.ts";
const { articles } = await collectArticles();
const g = articles.filter((a) => isGoogleNewsLink(a.link)).slice(0, 8);
for (const a of g) {
  const u = await resolveGoogleNews(a.link);
  console.log(u ? "OK " : "실패", a.source, "->", u?.slice(0, 90));
}
