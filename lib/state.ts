// 이미 보낸 기사 기록: 링크의 해시만 파일에 저장한다 (최근 7일). 기사 내용은 저장하지 않는다.
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

export const KEEP_DAYS = 7;
export type SentMap = Record<string, number>; // 해시 → 보낸 시각(ms)

export function hashLink(link: string): string {
  return createHash("sha1").update(link).digest("hex").slice(0, 16);
}

export function loadSent(file: string, now: number): SentMap {
  if (!existsSync(file)) return {};
  try {
    const raw = JSON.parse(readFileSync(file, "utf8")) as SentMap;
    const limit = now - KEEP_DAYS * 86400_000;
    return Object.fromEntries(Object.entries(raw).filter(([, t]) => typeof t === "number" && t >= limit));
  } catch {
    return {}; // 기록이 깨졌으면 새로 시작
  }
}

export function saveSent(file: string, sent: SentMap): void {
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, JSON.stringify(sent), "utf8");
}
