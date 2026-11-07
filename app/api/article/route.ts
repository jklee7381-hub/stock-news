// 기사 한 건의 상세(요약·용어 풀이·본문 앞부분). 읽기 전용이며 텔레그램 전송 기능은 없다.
// 주소를 사용자에게서 받지 않는다: 기사 번호(id)로 서버가 가진 목록에서만 찾는다.
import { cacheLife } from "next/cache";
import { getDetail, type Detail } from "@/lib/detail";
import { hashLink } from "@/lib/state";
import { getSnapshot } from "@/lib/snapshot";

// 성공한 결과만 1시간 보관한다 (실패는 오류로 던져 캐시에 남기지 않는다)
async function detailCached(link: string, title: string): Promise<Detail> {
  "use cache";
  cacheLife({ stale: 300, revalidate: 3600, expire: 7200 });
  const d = await getDetail({ link, title });
  if (!d.ok) throw new Error(d.reason);
  return d;
}

export async function GET(req: Request) {
  // 다른 사이트에서 부르는 요청은 막는다
  const origin = req.headers.get("origin");
  if (origin) {
    try {
      if (new URL(origin).host !== new URL(req.url).host) return Response.json({ error: "허용되지 않은 요청" }, { status: 403 });
    } catch {
      return Response.json({ error: "허용되지 않은 요청" }, { status: 403 });
    }
  }

  const id = new URL(req.url).searchParams.get("id") ?? "";
  if (!/^[0-9a-f]{16}$/.test(id)) return Response.json({ error: "잘못된 요청" }, { status: 400 });

  let snap;
  try {
    snap = await getSnapshot();
  } catch {
    return Response.json({ error: "기사 목록을 가져오지 못했습니다." }, { status: 502 });
  }
  const item = snap.items.find((i) => hashLink(i.link) === id);
  if (!item) return Response.json({ error: "목록에 없는 기사입니다." }, { status: 404 });

  try {
    return Response.json(await detailCached(item.link, item.title));
  } catch (e) {
    const reason = e instanceof Error && e.message ? e.message : "본문을 읽지 못했습니다.";
    // 실패해도 제목 기준 용어 풀이는 돌려준다
    const { findGlossary } = await import("@/lib/glossary");
    const safe = /주소|본문|접속/.test(reason) ? reason : "본문을 읽지 못했습니다.";
    return Response.json({ ok: false, reason: safe, summary: "", terms: findGlossary(item.title), excerpt: "", truncated: false } satisfies Detail);
  }
}
