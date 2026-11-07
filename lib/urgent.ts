// 긴급 판정: PRD의 4가지 조건 중 하나라도 맞고, 최근 3시간 안에 나온 기사만 긴급으로 본다.
import {
  URGENT_EARNINGS_TERMS, URGENT_INDEX_MOVE_TERMS, URGENT_INDEX_TERMS, URGENT_M7_TERMS,
  URGENT_MACRO_TERMS, URGENT_POLICY_TERMS,
} from "./config.ts";
import { findTerms } from "./filter.ts";

export const URGENT_MAX_AGE_MINUTES = 180;

export function urgentReason(title: string, publishedAt: string, now: Date): string | null {
  const ageMin = (now.getTime() - Date.parse(publishedAt)) / 60000;
  if (ageMin > URGENT_MAX_AGE_MINUTES) return null;
  const has = (terms: string[]) => findTerms(title, terms).length > 0;

  if (/속보/.test(title) && has(URGENT_MACRO_TERMS)) return "매크로 속보";
  if (has(URGENT_INDEX_TERMS) && has(URGENT_INDEX_MOVE_TERMS)) return "지수 급변동";
  if (has(URGENT_POLICY_TERMS)) return "정책·규제";
  if (has(URGENT_M7_TERMS) && has(URGENT_EARNINGS_TERMS) && /서프라이즈|쇼크/.test(title)) return "빅테크 실적 충격";
  return null;
}
