// Vercel 로그인 보호 켜기 (토큰은 .env에서 읽고 출력하지 않는다)
import { readFileSync } from "node:fs";
const env = Object.fromEntries(readFileSync(".env", "utf8").split(/\r?\n/).filter((l) => l.includes("=")).map((l) => [l.split("=")[0], l.slice(l.indexOf("=") + 1).trim()]));
const proj = JSON.parse(readFileSync(".vercel/project.json", "utf8"));
const t = env.VERCEL_TOKEN;
const url = `https://api.vercel.com/v9/projects/${proj.projectId}?teamId=${proj.orgId}`;
for (const type of ["all"]) {
  const r = await fetch(url, { method: "PATCH", headers: { Authorization: `Bearer ${t}`, "Content-Type": "application/json" }, body: JSON.stringify({ ssoProtection: { deploymentType: type } }) });
  const j = await r.json();
  console.log(type, "->", r.status, j.error?.message?.replaceAll(t, "[숨김]") ?? "ok", j.ssoProtection ? JSON.stringify(j.ssoProtection) : "");
  if (r.ok) break;
}
