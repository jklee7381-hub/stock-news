import fs from "node:fs";
let s = fs.readFileSync("lib/config.ts", "utf8");
const rep = (a, b) => { if (!s.includes(a)) throw new Error("못 찾음: " + a); s = s.replace(a, b); };
rep(`  "관세",
];`, `  "관세",
  // 실제 기사 점검(작업 3)에서 빠져 있던 것들
  "뉴욕증시", "뉴욕 증시", "미국 증시", "미국증시", "다우", "금리인상", "금리인하", "금리 동결",
  "미국 고용", "美 고용", "미 고용", "비농업", "美 국채", "미국 국채", "반도체주", "마이크론",
];

// '관세청'처럼 뜻이 다른 단어에 붙은 경우는 키워드로 보지 않는다.
export const NOT_FOLLOWED_BY: Record<string, string[]> = { "관세": ["청", "사", "법인"] };

// '급등'은 개별 급등주를 걸러내는 단어지만, 제목에 아래 지수·거시 단어가 함께 있으면 시장 전체 기사로 보고 살려 준다.
// 단, 특징주·상한가·테마주·급등주 같은 다른 배제어가 하나라도 있으면 그대로 폐기한다.
export const SURGE_EXEMPT_TERMS = ["급등"];
export const SURGE_EXEMPT_WITH: string[] = [
  "나스닥", "S&P500", "S&P 500", "필라델피아 반도체", "다우", "뉴욕증시", "뉴욕 증시", "미국 증시", "미국증시",
  "국채", "기준금리", "FOMC", "연준", "CPI",
];`);
rep(`"금리 인하", "금리 인상", "금리 동결", "실업률"`, `"금리 인하", "금리 인상", "금리 동결", "금리인하", "금리인상", "미국 고용", "美 고용", "미 고용", "비농업", "실업률"`);
rep(`["CPI", "FOMC", "금리 인하", "금리 인상", "파월", "실업률"]`, `["CPI", "FOMC", "금리 인하", "금리 인상", "금리인하", "금리인상", "파월", "실업률"]`);
fs.writeFileSync("lib/config.ts", s);

let f = fs.readFileSync("lib/filter.ts", "utf8");
const repf = (a, b) => { if (!f.includes(a)) throw new Error("못 찾음: " + a); f = f.replace(a, b); };
repf(`import { BLACKLIST, KEYWORDS, WORD_BOUNDARY_TERMS } from "./config.ts";`, `import {
  BLACKLIST, KEYWORDS, NOT_FOLLOWED_BY, SURGE_EXEMPT_TERMS, SURGE_EXEMPT_WITH, WORD_BOUNDARY_TERMS,
} from "./config.ts";`);
repf(`  if (!WORD_BOUNDARY_TERMS.has(term)) return t.includes(w);`, `  if (!WORD_BOUNDARY_TERMS.has(term)) {
    const banned = NOT_FOLLOWED_BY[term];
    if (!banned) return t.includes(w);
    let k = 0;
    while (true) {
      const i = t.indexOf(w, k);
      if (i < 0) return false;
      const next = t.slice(i + w.length);
      if (!banned.some((b) => next.startsWith(b))) return true;
      k = i + 1;
    }
  }`);
repf(`    const bad = findTerms(a.title, BLACKLIST);`, `    let bad = findTerms(a.title, BLACKLIST);
    // 지수·거시 단어가 함께 있는 '급등'은 시장 전체 기사이므로 배제하지 않는다
    if (bad.length && bad.every((b) => SURGE_EXEMPT_TERMS.includes(b)) && findTerms(a.title, SURGE_EXEMPT_WITH).length) bad = [];`);
fs.writeFileSync("lib/filter.ts", f);
