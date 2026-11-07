import { Suspense } from "react";
import { getSnapshot } from "@/lib/snapshot";
import { hashLink } from "@/lib/state";
import ArticleDetail from "./article-detail";

function kst(iso: string): string {
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false,
  }).format(new Date(iso));
}

// 링크는 http(s)만 허용한다
function safeHref(link: string): string {
  return /^https?:\/\//i.test(link) ? link : "#";
}

async function Board() {
  let s;
  try {
    s = await getSnapshot();
  } catch {
    return (
      <p className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        기사를 가져오지 못했습니다. 잠시 뒤 새로고침해 주세요.
      </p>
    );
  }
  const urgentCount = s.items.filter((i) => i.urgent).length;
  return (
    <>
      <p className="text-sm text-slate-500">
        {kst(s.updatedAt)} 기준 · 수집 {s.total}건 → 통과 {s.items.length}건 (긴급 {urgentCount}건) · 폐기 {s.dropped.length}건
      </p>
      {s.failures.length > 0 && (
        <p className="mt-2 text-xs text-amber-700">일부 출처({s.failures.length}곳)를 읽지 못했습니다.</p>
      )}

      <ul className="mt-4 space-y-3">
        {s.items.map((it) => (
          <li
            key={it.link}
            className={`rounded-2xl border bg-white p-4 shadow-sm ${it.urgent ? "border-red-300" : "border-slate-200"}`}
          >
            <div className="flex items-center gap-2 text-xs text-slate-500">
              {it.urgent && (
                <span className="rounded-full bg-red-600 px-2 py-0.5 font-semibold text-white">
                  🚨 긴급 · {it.urgentReason}
                </span>
              )}
              <span>{it.source}{it.sourceCount > 1 ? ` 외 ${it.sourceCount - 1}곳` : ""}</span>
              <span>· {kst(it.publishedAt)}</span>
            </div>
            <a
              href={safeHref(it.link)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 block text-base font-semibold leading-snug text-slate-900 hover:text-indigo-700"
            >
              {it.title}
            </a>
            <div className="mt-2 flex items-center gap-3">
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100" aria-hidden>
                <div className="h-full rounded-full bg-indigo-700" style={{ width: `${it.score.total}%` }} />
              </div>
              <span className="w-12 text-right text-sm font-bold text-indigo-900">{it.score.total}점</span>
            </div>
            <ArticleDetail id={hashLink(it.link)} link={it.link} />
            <p className="mt-2 text-xs text-slate-500">
              영향도 {it.score.impact} · 매체 {it.score.trust} · 다수보도 {it.score.multi} · 최신성 {it.score.recency}
              {it.keywords.length > 0 && <> · {it.keywords.join(", ")}</>}
            </p>
          </li>
        ))}
        {s.items.length === 0 && <li className="text-sm text-slate-500">조건에 맞는 기사가 없습니다.</li>}
      </ul>

      <details className="mt-8 rounded-2xl border border-slate-200 bg-white p-4">
        <summary className="cursor-pointer text-sm font-semibold text-slate-700">
          폐기된 기사와 이유 보기 (배제어 {s.dropped.filter((d) => d.reason === "배제어").length}건)
        </summary>
        <ul className="mt-3 space-y-1 text-xs text-slate-600">
          {s.dropped
            .filter((d) => d.reason === "배제어")
            .map((d) => (
              <li key={d.link}>
                <span className="mr-1 rounded bg-slate-100 px-1.5 py-0.5 font-medium">{d.detail}</span>
                {d.title} <span className="text-slate-400">({d.source})</span>
              </li>
            ))}
        </ul>
        <p className="mt-3 text-xs text-slate-400">
          그 밖에 필수 키워드가 없어 제외된 기사 {s.dropped.filter((d) => d.reason === "키워드없음").length}건은 표시하지 않습니다.
        </p>
      </details>
    </>
  );
}

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8">
      <h1 className="text-2xl font-bold text-indigo-950">미국지수·반도체 뉴스 알리미</h1>
      <p className="mb-4 mt-1 text-sm text-slate-600">
        QQQ·나스닥·반도체 중심 기사를 점수순으로 보여 줍니다. 텔레그램 알림은 자동으로 따로 전송됩니다.
      </p>
      <Suspense fallback={<p className="text-sm text-slate-500">기사를 모으는 중입니다…</p>}>
        <Board />
      </Suspense>
      <p className="mt-8 text-xs text-slate-400">기사 제목과 원문 링크만 표시합니다. 투자 판단과 책임은 본인에게 있습니다.</p>
    </main>
  );
}
