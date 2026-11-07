// RSS 수집: 새 라이브러리 없이 직접 읽는다. 기사 제목·매체·링크·시각만 가져온다.
import {
  ALLOWED_HOSTS, FETCH_TIMEOUT_MS, GOOGLE_QUERIES, MAX_FEED_BYTES, PUBLISHER_FEEDS,
} from "./config.ts";

export type Article = { title: string; source: string; link: string; publishedAt: string };

const ENTITIES: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };

function decode(s: string): string {
  return s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(parseInt(d, 10)))
    .replace(/&([a-z]+);/gi, (m, n) => ENTITIES[n.toLowerCase()] ?? m)
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function tag(block: string, name: string): string {
  const m = block.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`, "i"));
  return m ? decode(m[1]) : "";
}

// 주소가 허용 목록 안인지 확인하고, 시간·크기 제한을 걸어 받아 온다.
async function fetchText(url: string): Promise<string> {
  const u = new URL(url);
  if (u.protocol !== "https:" || !ALLOWED_HOSTS.has(u.hostname)) throw new Error("허용되지 않은 주소");
  const res = await fetch(url, {
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    headers: { "User-Agent": "Mozilla/5.0 (compatible; stock-news-bot)" },
    redirect: "error",
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const buf = await res.arrayBuffer();
  if (buf.byteLength > MAX_FEED_BYTES) throw new Error("응답이 너무 큼");
  return new TextDecoder("utf-8").decode(buf);
}

export function parseRss(xml: string, fallbackSource: string): Article[] {
  const items = xml.match(/<item[\s>][\s\S]*?<\/item>/gi) ?? [];
  const out: Article[] = [];
  for (const it of items) {
    let title = tag(it, "title");
    const link = tag(it, "link");
    const pub = tag(it, "pubDate") || tag(it, "dc:date");
    let source = tag(it, "source") || fallbackSource;
    // 구글뉴스는 제목 끝에 ' - 매체명'이 붙는다 → 떼어 낸다
    const suffix = title.lastIndexOf(" - ");
    if (suffix > 0 && (!source || title.slice(suffix + 3) === source || !tag(it, "source"))) {
      if (!tag(it, "source")) source = title.slice(suffix + 3);
      title = title.slice(0, suffix);
    }
    const t = Date.parse(pub);
    if (!title || !link || Number.isNaN(t)) continue;
    out.push({ title, source: source || "알 수 없음", link, publishedAt: new Date(t).toISOString() });
  }
  return out;
}

export function googleUrl(query: string): string {
  return `https://news.google.com/rss/search?q=${encodeURIComponent(query + " when:1d")}&hl=ko&gl=KR&ceid=KR:ko`;
}

const PUBLISHER_NAMES: Record<string, string> = {
  "www.yna.co.kr": "연합뉴스", "www.hankyung.com": "한국경제", "www.mk.co.kr": "매일경제",
};

// 모든 피드를 받아 기사 목록으로 합친다. 일부가 실패해도 나머지로 진행하고, 실패 목록을 함께 돌려준다.
export async function collectArticles(): Promise<{ articles: Article[]; failures: string[] }> {
  const jobs = [
    ...GOOGLE_QUERIES.map((q) => ({ name: `구글뉴스:${q}`, url: googleUrl(q), source: "" })),
    ...PUBLISHER_FEEDS.map((url) => ({ name: new URL(url).hostname, url, source: PUBLISHER_NAMES[new URL(url).hostname] ?? "" })),
  ];
  const results = await Promise.allSettled(jobs.map(async (j) => parseRss(await fetchText(j.url), j.source)));
  const articles: Article[] = [];
  const failures: string[] = [];
  results.forEach((r, i) => {
    if (r.status === "fulfilled") articles.push(...r.value);
    else failures.push(`${jobs[i].name}: ${r.reason instanceof Error ? r.reason.message : "오류"}`);
  });
  // 같은 링크는 한 번만
  const seen = new Set<string>();
  const unique = articles.filter((a) => (seen.has(a.link) ? false : (seen.add(a.link), true)));
  return { articles: unique, failures };
}
