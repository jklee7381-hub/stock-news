"use client";

import { useState } from "react";

type Detail = {
  ok: boolean;
  reason: string;
  summary: string;
  terms: { term: string; explanation: string }[];
  excerpt: string;
  truncated: boolean;
};

export default function ArticleDetail({ id, link }: { id: string; link: string }) {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [d, setD] = useState<Detail | null>(null);

  async function toggle() {
    const next = !open;
    setOpen(next);
    if (!next || state === "loading" || state === "done") return;
    setState("loading");
    try {
      const res = await fetch(`/api/article?id=${id}`);
      if (!res.ok) throw new Error();
      setD((await res.json()) as Detail);
      setState("done");
    } catch {
      setState("error");
    }
  }

  return (
    <div className="mt-3">
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        className="rounded border border-[#ebebeb] bg-white px-2.5 py-1 text-xs font-medium text-[#555555] transition hover:border-[#083891] hover:text-[#083891]"
      >
        {open ? "▲ 접기" : "▼ 요약·용어·본문 보기"}
      </button>

      {open && (
        <div className="mt-3 space-y-3 rounded-2xl bg-[#f4f5f6] p-4 text-sm leading-relaxed text-[#1e2124]">
          {state === "loading" && <p className="text-[#6d7882]">본문을 가져오는 중입니다…</p>}
          {state === "error" && <p className="text-[#d92b2b]">불러오지 못했습니다. 잠시 뒤 다시 눌러 주세요.</p>}

          {state === "done" && d && (
            <>
              {d.ok && d.summary && (
                <section>
                  <h3 className="mb-1 text-xs font-bold text-[#083891]">요약</h3>
                  <p>{d.summary}</p>
                </section>
              )}

              {d.terms.length > 0 && (
                <section>
                  <h3 className="mb-1 text-xs font-bold text-[#083891]">용어 풀이</h3>
                  <dl className="space-y-1 text-xs">
                    {d.terms.map((t) => (
                      <div key={t.term}>
                        <dt className="inline font-semibold">{t.term}</dt>
                        <dd className="inline text-[#58616a]"> — {t.explanation}</dd>
                      </div>
                    ))}
                  </dl>
                </section>
              )}

              <section>
                <h3 className="mb-1 text-xs font-bold text-[#083891]">본문</h3>
                {d.ok ? (
                  <div className="space-y-2">
                    {d.excerpt.split(/\n+/).map((p, i) => (
                      <p key={i}>{p}</p>
                    ))}
                    {d.truncated && <p className="text-xs text-[#6d7882]">본문 앞부분만 보여 드립니다.</p>}
                  </div>
                ) : (
                  <p className="text-[#6d7882]">{d.reason || "본문을 읽지 못했습니다."}</p>
                )}
              </section>
            </>
          )}

          <a
            href={/^https?:\/\//i.test(link) ? link : "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-xs font-semibold text-[#083891] underline"
          >
            원문에서 전체 보기 ↗
          </a>
        </div>
      )}
    </div>
  );
}
