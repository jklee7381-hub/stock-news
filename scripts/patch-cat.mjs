import fs from "node:fs";
let s = fs.readFileSync("lib/score.ts", "utf8");
const rep = (a, b) => { if (!s.includes(a)) throw new Error("못 찾음: " + a.slice(0, 40)); s = s.replace(a, b); };
rep(`import {\n  IMPACT_RULES,`, `import {\n  CATEGORIES, CATEGORY_OTHER, IMPACT_RULES,`);
rep(`  keywords: string[];\n  score: ScoreParts;`, `  keywords: string[];\n  category: string;\n  score: ScoreParts;`);
rep(`export function trustOf`, `export function categoryOf(title: string): string {
  for (const c of CATEGORIES) if (findTerms(title, c.terms).length) return c.name;
  return CATEGORY_OTHER;
}

export function trustOf`);
rep(`      ...a,\n      score:`, `      ...a,\n      category: categoryOf(a.title),\n      score:`);
fs.writeFileSync("lib/score.ts", s);
