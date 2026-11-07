import { createHash } from "node:crypto";
const B = "https://stock-news-blush.vercel.app";
const h = (l) => createHash("sha1").update(l).digest("hex").slice(0, 16);
const j = await (await fetch(B + "/api/articles")).json();
const g = j.items.filter((i) => i.link.includes("news.google.com"));
const d = j.items.filter((i) => !i.link.includes("news.google.com"));
console.log("통과", j.items.length, "직접", d.length, "구글", g.length);
for (const it of [d[0], g[0], g[1], g[2], g[3]].filter(Boolean)) {
  const r = await fetch(`${B}/api/article?id=${h(it.link)}`);
  const x = await r.json();
  console.log(r.status, it.source, "|", x.ok, x.reason || "", "| 요약:", (x.summary || "").slice(0, 50), "| 용어", x.terms?.length, "| 본문", x.excerpt?.length);
}
