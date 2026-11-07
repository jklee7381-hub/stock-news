import { hashLink, loadSent, saveSent } from "../lib/state.ts";
import { rmSync } from "node:fs";
const f = ".state/test-sent.json"; const now = Date.now();
saveSent(f, { [hashLink("a")]: now, [hashLink("old")]: now - 8 * 86400_000 });
const s = loadSent(f, now);
console.log("a 기록 있음:", !!s[hashLink("a")], "| 8일 전 기록 사라짐:", !s[hashLink("old")]);
rmSync(f);
