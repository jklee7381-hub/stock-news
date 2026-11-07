import fs from "node:fs";
let s = fs.readFileSync("app/page.tsx", "utf8");
const rep = (a, b) => { if (!s.includes(a)) throw new Error("못 찾음: " + a.slice(0, 40)); s = s.replace(a, b); };
rep(`import { getSnapshot } from "@/lib/snapshot";`, `import { getSnapshot } from "@/lib/snapshot";\nimport { hashLink } from "@/lib/state";\nimport ArticleDetail from "./article-detail";`);
rep(`            <p className="mt-1 text-xs text-slate-500">
              영향도`, `            <ArticleDetail id={hashLink(it.link)} link={it.link} />
            <p className="mt-2 text-xs text-slate-500">
              영향도`);
fs.writeFileSync("app/page.tsx", s);
let c = fs.readFileSync("next.config.ts", "utf8");
if (!c.includes("serverExternalPackages")) c = c.replace("cacheComponents: true,", "cacheComponents: true,\n  // 본문 추출용 무거운 패키지는 번들에 넣지 않고 그대로 불러온다 (배포 서버 오류 방지)\n  serverExternalPackages: [\"jsdom\"],");
fs.writeFileSync("next.config.ts", c);
