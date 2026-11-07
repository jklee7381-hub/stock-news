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

// 화면에 보이는 카테고리 순서
const CATEGORY_ORDER = ["금리·물가·고용", "지수·시장", "반도체", "빅테크·AI", "정책·규제", "기타"];

const card = "rounded-[24px] border border-[#ebebeb] bg-white";

function Stat({ label, value, accent }: { label: string; value: number | string; accent?: boolean }) {
  return (
    <div className="flex-1 rounded-2xl bg-[#f4f5f6] px-3 py-3 text-center">
      <div className={`text-2xl font-extrabold tracking-[-0.03em] ${accent ? "text-[#d92b2b]" : "text-[#083891]"}`}>{value}</div>
      <div className="mt-0.5 text-xs font-medium text-[#58616a]">{label}</div>
    </div>
  );
}

async function Board() {
  let s;
  try {
    s = await getSnapshot();
  } catch {
    return (
      <p className={`${card} p-5 text-sm text-[#d92b2b] shadow-[0_10px_28px_rgba(5,37,97,0.22)]`}>
        기사를 가져오지 못했습니다. 잠시 뒤 새로고침해 주세요.
      </p>
    );
  }
  const urgentCount = s.items.filter((i) => i.urgent).length;
  const dropped = s.dropped.filter((d) => d.reason === "배제어");
  // 카테고리별로 묶는다 (각 묶음 안은 점수순 그대로)
  const groups = CATEGORY_ORDER.map((name) => ({ name, items: s.items.filter((i) => i.category === name) })).filter((g) => g.items.length > 0);
  return (
    <>
      {/* 현황 */}
      <section className={`${card} p-5 shadow-[0_10px_28px_rgba(5,37,97,0.22)]`}>
        <div className="flex items-baseline justify-between gap-2">
          <h2 className="text-base font-bold text-[#111111]">오늘의 기사 현황</h2>
          <span className="text-xs text-[#6d7882]">{kst(s.updatedAt)} 기준</span>
        </div>
        <div className="mt-3 flex gap-2">
          <Stat label="수집" value={s.total} />
          <Stat label="선별" value={s.items.length} />
          <Stat label="긴급" value={urgentCount} accent />
          <Stat label="제외" value={s.dropped.length} />
        </div>
        {s.failures.length > 0 && (
          <p className="mt-3 text-xs text-[#6d7882]">일부 출처({s.failures.length}곳)를 읽지 못했습니다.</p>
        )}
      </section>

      {/* 기사 목록: 카테고리별 */}
      {groups.length > 1 && (
        <nav aria-label="카테고리" className="flex flex-wrap gap-2">
          {groups.map((g) => (
            <a
              key={g.name}
              href={`#cat-${g.name}`}
              className="rounded-full border border-[#ebebeb] bg-white px-3 py-1.5 text-xs font-semibold text-[#464c53] transition hover:border-[#083891] hover:text-[#083891]"
            >
              {g.name} <span className="text-[#083891]">{g.items.length}</span>
            </a>
          ))}
        </nav>
      )}
      {groups.map((g) => (
        <section key={g.name} id={`cat-${g.name}`} className="scroll-mt-4">
          <h2 className="mb-3 flex items-center gap-2 text-base font-bold text-[#111111]">
            <span className="inline-block h-4 w-1 rounded-full bg-[#083891]" aria-hidden />
            {g.name} <span className="font-medium text-[#6d7882]">({g.items.length}건)</span>
          </h2>
          <ul className="space-y-3">
            {g.items.map((it) => (
              <li key={it.link} className={`${card} p-4 ${it.urgent ? "border-[#d92b2b]" : ""}`}>
                <div className="flex flex-wrap items-center gap-2 text-xs text-[#6d7882]">
                  {it.urgent && (
                    <span className="rounded bg-[#d92b2b] px-2 py-0.5 font-semibold text-white">
                      긴급 · {it.urgentReason}
                    </span>
                  )}
                  <span className="font-semibold text-[#464c53]">
                    {it.source}
                    {it.sourceCount > 1 ? ` 외 ${it.sourceCount - 1}곳` : ""}
                  </span>
                  <span>· {kst(it.publishedAt)}</span>
                </div>
                <a
                  href={safeHref(it.link)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1.5 block text-[17px] font-bold leading-snug tracking-[-0.02em] text-[#1e2124] hover:text-[#083891]"
                >
                  {it.title}
                </a>
                <div className="mt-3 flex items-center gap-3">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#ecf2fe]" aria-hidden>
                    <div className="h-full rounded-full bg-[#083891]" style={{ width: `${it.score.total}%` }} />
                  </div>
                  <span className="w-12 text-right text-sm font-extrabold text-[#083891]">{it.score.total}점</span>
                </div>
                <ArticleDetail id={hashLink(it.link)} link={it.link} />
                <p className="mt-2.5 text-xs text-[#6d7882]">
                  영향도 {it.score.impact} · 매체 {it.score.trust} · 다수보도 {it.score.multi} · 최신성 {it.score.recency}
                  {it.keywords.length > 0 && <> · {it.keywords.join(", ")}</>}
                </p>
              </li>
            ))}
          </ul>
        </section>
      ))}
      {s.items.length === 0 && <p className="text-sm text-[#6d7882]">조건에 맞는 기사가 없습니다.</p>}

      {/* 제외된 기사 */}
      <details className={`${card} p-4`}>
        <summary className="cursor-pointer text-sm font-bold text-[#464c53]">제외된 기사와 이유 (배제어 {dropped.length}건)</summary>
        <ul className="mt-3 space-y-1.5 text-xs text-[#58616a]">
          {dropped.map((d) => (
            <li key={d.link}>
              <span className="mr-1.5 rounded bg-[#f4f5f6] px-1.5 py-0.5 font-semibold text-[#464c53]">{d.detail}</span>
              {d.title} <span className="text-[#6d7882]">({d.source})</span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-[#6d7882]">
          필수 키워드가 없어 제외된 기사 {s.dropped.filter((d) => d.reason === "키워드없음").length}건은 표시하지 않습니다.
        </p>
      </details>
    </>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen pb-16">
      {/* 머리: 이름 */}
      <header className="bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-5">
          <span className="text-lg font-extrabold tracking-[-0.04em]">뉴스 알리미</span>
          <span className="rounded-full border border-[#083891] px-3 py-1 text-xs font-medium text-[#083891]">
            QQQ · SOXX
          </span>
        </div>
      </header>

      {/* 큰 제목 */}
      <div className="bg-gradient-to-b from-[#094080] to-[#052561] px-4 pb-24 pt-10 text-white">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-[46px] font-extrabold uppercase leading-[1.02] tracking-[-0.045em] sm:text-[76px]">
            Market
            <br />
            Brief
          </h1>
          <p className="mt-4 text-sm text-[#d6e0eb]">미국 지수·반도체 관련 기사를 점수로 거르고 텔레그램으로 알려 줍니다</p>
        </div>
      </div>

      <main className="mx-auto -mt-14 w-full max-w-3xl space-y-8 px-4">
        <Suspense fallback={<p className={`${card} p-5 text-sm text-[#6d7882] shadow-[0_10px_28px_rgba(5,37,97,0.22)]`}>기사를 모으는 중입니다…</p>}>
          <Board />
        </Suspense>
        <p className="text-xs text-[#6d7882]">기사 제목과 원문 링크, 본문 앞부분만 표시합니다. 투자 판단과 책임은 본인에게 있습니다.</p>
      </main>
    </div>
  );
}
