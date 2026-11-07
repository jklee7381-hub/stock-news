import fs from "node:fs";
let s = fs.readFileSync("lib/extract.ts", "utf8");
const rep = (a, b) => { if (!s.includes(a)) throw new Error("못 찾음: " + a.slice(0, 40)); s = s.replace(a, b); };
rep(`import { cleanBodyText } from "./clean-body";\nimport { FEEDS } from "./feeds";`, `import { cleanBodyText } from "./clean-body.ts";`);
rep(`// 허용 도메인: 우리가 RSS를 읽는 언론사의 대표 도메인만\nconst ALLOWED_DOMAINS = new Set(FEEDS.map((f) => baseDomain(new URL(f.url).hostname)));\n`,
`// 주소는 서버가 가진 기사 목록(구글뉴스·언론사 RSS)에서만 오고 사용자가 직접 넣지 않는다.
// 그래서 도메인 허용 목록 대신 아래의 내부 주소 차단·이동 검사·크기·시간 제한으로 지킨다.
`);
rep(`  if (!ALLOWED_DOMAINS.has(baseDomain(url.hostname))) return null;\n`, ``);
rep(`const MAX_BODY_CHARS = 20000;`, `const MAX_BODY_CHARS = 6000;`);
rep(`"User-Agent": "Mozilla/5.0 (compatible; TodayScrap/0.1)"`, `"User-Agent": "Mozilla/5.0 (compatible; stock-news-bot)"`);
fs.writeFileSync("lib/extract.ts", s);
