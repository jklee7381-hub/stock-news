import fs from "node:fs";
let s = fs.readFileSync("app/page.tsx", "utf8");
const start = s.indexOf("      {/* 기사 목록 */}");
const end = s.indexOf("      {/* 제외된 기사 */}");
if (start < 0 || end < 0) throw new Error("마커 못 찾음");
const newSection = `      {/* 기사 목록: 카테고리별 */}
      {groups.length > 1 && (
        <nav aria-label="카테고리" className="-mb-3 flex flex-wrap gap-2">
          {groups.map((g) => (
            <a
              key={g.name}
              href={\`#cat-\${g.name}\`}
              className="rounded-full border border-[#ebebeb] bg-white px-3 py-1.5 text-xs font-semibold text-[#464c53] transition hover:border-[#083891] hover:text-[#083891]"
            >
              {g.name} <span className="text-[#083891]">{g.items.length}</span>
            </a>
          ))}
        </nav>
      )}
      {groups.map((g) => (
        <section key={g.name} id={\`cat-\${g.name}\`} className="scroll-mt-4">
          <h2 className="mb-3 flex items-center gap-2 text-base font-bold text-[#111111]">
            <span className="inline-block h-4 w-1 rounded-full bg-[#083891]" aria-hidden />
            {g.name} <span className="font-medium text-[#6d7882]">({g.items.length}건)</span>
          </h2>
          <ul className="space-y-3">
            {g.items.map((it) => (
              <li key={it.link} className={\`\${card} p-4 \${it.urgent ? "border-[#d92b2b]" : ""}\`}>
                <div className="flex flex-wrap items-center gap-2 text-xs text-[#6d7882]">
                  {it.urgent && (
                    <span className="rounded bg-[#d92b2b] px-2 py-0.5 font-semibold text-white">
                      긴급 · {it.urgentReason}
                    </span>
                  )}
                  <span className="font-semibold text-[#464c53]">
                    {it.source}
                    {it.sourceCount > 1 ? \` 외 \${it.sourceCount - 1}곳\` : ""}
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
                    <div className="h-full rounded-full bg-[#083891]" style={{ width: \`\${it.score.total}%\` }} />
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

`;
s = s.slice(0, start) + newSection + s.slice(end);
// 그룹 계산
s = s.replace(`  const dropped = s.dropped.filter((d) => d.reason === "배제어");`, `  const dropped = s.dropped.filter((d) => d.reason === "배제어");
  // 카테고리별로 묶는다 (각 묶음 안은 점수순 그대로)
  const groups = CATEGORY_ORDER.map((name) => ({ name, items: s.items.filter((i) => i.category === name) })).filter((g) => g.items.length > 0);`);
s = s.replace(`const card = `, `// 화면에 보이는 카테고리 순서
const CATEGORY_ORDER = ["금리·물가·고용", "지수·시장", "반도체", "빅테크·AI", "정책·규제", "기타"];

const card = `);
fs.writeFileSync("app/page.tsx", s);
