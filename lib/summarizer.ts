// 요약: AI 없이 규칙으로 텔레그램 메시지를 만든다. 기사 제목·매체·링크만 사용하고 내용을 지어내지 않는다.
import type { Scored } from "./score.ts";

export type BriefingKind = "us-close" | "kr-close" | "pre-market";

export const BRIEFING_TITLES: Record<BriefingKind, string> = {
  "us-close": "미국장 마감 브리핑",
  "kr-close": "한국장 마감·아시아 반도체 브리핑",
  "pre-market": "미국장 개장 전 체크",
};

export const BRIEFING_MAX_ITEMS = 8;
export const BRIEFING_MAX_PER_KEYWORD = 2;
const TELEGRAM_LIMIT = 4000; // 텔레그램 한도(4096)보다 조금 작게

// 텔레그램 HTML 모드에서 깨지지 않게 특수문자를 바꾼다.
export function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
function escAttr(s: string): string {
  return esc(s).replace(/"/g, "&quot;");
}

function kstLabel(now: Date): string {
  const k = new Date(now.getTime() + 9 * 3600_000);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(k.getUTCMonth() + 1)}/${p(k.getUTCDate())} ${p(k.getUTCHours())}:${p(k.getUTCMinutes())}`;
}

// 기사를 대표 키워드로 묶는다. 대표 키워드 = 그 기사의 키워드 중 전체에서 가장 많이 나온 것
function groupByKeyword(items: Scored[]): { keyword: string; list: Scored[] }[] {
  const count = new Map<string, number>();
  for (const it of items) for (const k of it.keywords) count.set(k, (count.get(k) ?? 0) + 1);
  const groups = new Map<string, Scored[]>();
  for (const it of items) {
    const main = [...it.keywords].sort((a, b) => (count.get(b) ?? 0) - (count.get(a) ?? 0))[0];
    if (!groups.has(main)) groups.set(main, []);
    groups.get(main)!.push(it);
  }
  return [...groups.entries()]
    .map(([keyword, list]) => ({ keyword, list }))
    .sort((a, b) => b.list[0].score.total - a.list[0].score.total);
}

export function buildBriefing(kind: BriefingKind, items: Scored[], now: Date): string {
  const head = `📊 <b>[${BRIEFING_TITLES[kind]}]</b> ${kstLabel(now)}`;
  if (!items.length) return `${head}\n\n새로 확인할 주요 소식이 없습니다.`;

  // 키워드별로 최대 2건, 전체 8건
  const picked: { keyword: string; list: Scored[] }[] = [];
  let total = 0;
  for (const g of groupByKeyword(items)) {
    if (total >= BRIEFING_MAX_ITEMS) break;
    const list = g.list.slice(0, Math.min(BRIEFING_MAX_PER_KEYWORD, BRIEFING_MAX_ITEMS - total));
    picked.push({ keyword: g.keyword, list });
    total += list.length;
  }

  const counts = picked.map((g) => `#${g.keyword.replace(/[^0-9A-Za-z가-힣]/g, "")}`).join(" ");
  const lines: string[] = [head, "", `🔑 ${esc(counts)}`, ""];
  for (const g of picked) {
    lines.push(`<b>${esc(g.keyword)}</b>`);
    for (const it of g.list) {
      const more = it.sourceCount > 1 ? ` 외 ${it.sourceCount - 1}곳` : "";
      lines.push(`• <a href="${escAttr(it.link)}">${esc(it.title)}</a> (${esc(it.source)}${more}, ${it.score.total}점)`);
    }
    lines.push("");
  }
  let text = lines.join("\n").trim();
  if (text.length > TELEGRAM_LIMIT) text = text.slice(0, TELEGRAM_LIMIT).replace(/\n[^\n]*$/, "");
  return text;
}

export function buildUrgent(it: Scored): string {
  return [
    `🚨 <b>[긴급 · ${esc(it.urgentReason ?? "속보")}]</b>`,
    `📌 <a href="${escAttr(it.link)}">${esc(it.title)}</a>`,
    `• 매체: ${esc(it.source)} · 점수 ${it.score.total}`,
    `• 키워드: ${esc(it.keywords.join(", "))}`,
  ].join("\n");
}
