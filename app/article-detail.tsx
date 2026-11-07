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
        className="rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-800 hover:bg-indigo-100"
      >
        {open ? "▲ 접기" : "▼ 요약·용어·본문 보기"}
      </button>

      {open && (
        <div className="mt-3 space-y-3 rounded-xl bg-slate-50 p-3 text-sm leading-relaxed text-slate-800">
          {state === "loading" && <p className="text-slate-500">본문을 가져오는 중입니다…</p>}
          {state === "error" && <p className="text-red-600">불러오지 못했습니다. 잠시 뒤 다시 눌러 주세요.</p>}

          {state === "done" && d && (
            <>
              {d.ok && d.summary && (
                <section>
                  <h3 className="mb-1 text-xs font-bold text-indigo-900">요약</h3>
                  <p>{d.summary}</p>
                </section>
              )}

              {d.terms.length > 0 && (
                <section>
                  <h3 className="mb-1 text-xs font-bold text-indigo-900">용어 풀이</h3>
                  <dl className="space-y-1 text-xs">
                    {d.terms.map((t) => (
                      <div key={t.term}>
                        <dt className="inline font-semibold">{t.term}</dt>
                        <dd className="inline text-slate-600"> — {t.explanation}</dd>
                      </div>
                    ))}
                  </dl>
                </section>
              )}

              <section>
                <h3 className="mb-1 text-xs font-bold text-indigo-900">본문</h3>
                {d.ok ? (
                  <div className="space-y-2">
                    {d.excerpt.split(/\n+/).map((p, i) => (
                      <p key={i}>{p}</p>
                    ))}
                    {d.truncated && <p className="text-xs text-slate-500">본문 앞부분만 보여 드립니다.</p>}
                  </div>
                ) : (
                  <p className="text-slate-500">{d.reason || "본문을 읽지 못했습니다."}</p>
                )}
              </section>
            </>
          )}

          <a
            href={/^https?:\/\//i.test(link) ? link : "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-xs font-semibold text-indigo-700 underline"
          >
            원문에서 전체 보기 ↗
          </a>
        </div>
      )}
    </div>
  );
}
