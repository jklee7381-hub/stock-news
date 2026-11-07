import fs from "node:fs";
let s = fs.readFileSync("lib/score.ts", "utf8");
const a = `    const winner = s.score.total > cur.score.total ? s : cur;
    groups.set(key, { ...winner, sourceCount: cur.sourceCount + 1, urgent: cur.urgent || s.urgent, urgentReason: cur.urgentReason ?? s.urgentReason });`;
const b = `    const winner = s.score.total > cur.score.total ? s : cur;
    const other = winner === s ? cur : s;
    // 구글뉴스를 거치는 링크보다 언론사 원문 링크를 우선한다 (본문을 바로 읽을 수 있다)
    const link = isGoogleNewsLink(winner.link) && !isGoogleNewsLink(other.link) ? other.link : winner.link;
    groups.set(key, { ...winner, link, sourceCount: cur.sourceCount + 1, urgent: cur.urgent || s.urgent, urgentReason: cur.urgentReason ?? s.urgentReason });`;
if (!s.includes(a)) throw new Error("못 찾음");
s = s.replace(a, b).replace(`import { filterArticles, findTerms, type Dropped } from "./filter.ts";`, `import { filterArticles, findTerms, type Dropped } from "./filter.ts";\nimport { isGoogleNewsLink } from "./gnews.ts";`);
fs.writeFileSync("lib/score.ts", s);
