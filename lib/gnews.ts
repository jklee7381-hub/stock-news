// 구글뉴스 링크 → 언론사 원문 주소 해석.
// 구글뉴스 RSS의 링크는 구글을 거치는 주소라 본문을 바로 읽을 수 없다.
// 구글 기사 페이지에서 서명 값을 읽고, 구글이 쓰는 내부 요청으로 원문 주소를 받아 온다.
// 구글이 방식을 바꾸면 실패할 수 있으며, 실패하면 null을 돌려준다 (화면에는 '원문에서 보기'만 보인다).

const TIMEOUT_MS = 8000;
const UA = "Mozilla/5.0 (compatible; stock-news-bot)";

export function isGoogleNewsLink(link: string): boolean {
  try {
    const u = new URL(link);
    return u.hostname === "news.google.com" && /^\/(rss\/)?articles\//.test(u.pathname);
  } catch {
    return false;
  }
}

export async function resolveGoogleNews(link: string): Promise<string | null> {
  try {
    if (!isGoogleNewsLink(link)) return null;
    const id = new URL(link).pathname.split("/").pop() ?? "";
    if (!/^[A-Za-z0-9_-]+$/.test(id)) return null;

    // 1) 기사 페이지에서 서명(signature)과 시각(timestamp)을 읽는다
    const page = await fetch(`https://news.google.com/articles/${id}?hl=ko&gl=KR&ceid=KR:ko`, {
      headers: { "User-Agent": UA },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!page.ok) return null;
    const html = await page.text();
    const sg = /data-n-a-sg="([^"]+)"/.exec(html)?.[1];
    const ts = /data-n-a-ts="([^"]+)"/.exec(html)?.[1];
    if (!sg || !ts) return null;

    // 2) 원문 주소를 요청한다
    const inner = JSON.stringify([
      "garturlreq",
      [["X", "X", ["X", "X"], null, null, 1, 1, "KR:ko", null, 1, null, null, null, null, null, 0, 1], "X", "X", 1, [1, 1, 1], 1, 1, null, 0, 0, null, 0],
      id,
      Number(ts),
      sg,
    ]);
    const body = "f.req=" + encodeURIComponent(JSON.stringify([[["Fbv4je", inner, null, "generic"]]]));
    const res = await fetch("https://news.google.com/_/DotsSplashUi/data/batchexecute", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8", "User-Agent": UA },
      body,
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) return null;
    const text = await res.text();
    const m = /\\"garturlres\\",\\"(https?:[^"\\]+)\\"/.exec(text);
    if (!m) return null;
    const url = m[1].replace(/\\u003d/g, "=").replace(/\\u0026/g, "&");
    return /^https?:\/\//.test(url) ? url : null;
  } catch {
    return null;
  }
}
