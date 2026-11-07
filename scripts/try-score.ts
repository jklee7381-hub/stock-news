import { processArticles } from "../lib/score.ts";
const now = new Date();
const mk = (title: string, source = "연합인포맥스", minAgo = 10) => ({ title, source, link: "x" + title, publishedAt: new Date(now.getTime() - minAgo * 60000).toISOString() });
const cases: [string, boolean][] = [
  ["[속보] 美 10월 CPI 전년비 2.4% 상승", true],
  ["[속보] 파월 의장 \"금리 인하 서두르지 않겠다\"", true],
  ["나스닥 선물 2% 하락…빅테크 투매", true],
  ["美 상무부, 대중 반도체 수출 통제 확대", true],
  ["엔비디아 실적 서프라이즈…시간외 급등", false], // 급등 → 배제
  ["마이크로소프트 어닝 쇼크, 나스닥 선물 흔들", true],
  ["[특징주] HBM 관련주 상한가", false],
  ["CBS 뉴스 나스닥 마감 시황", false], // CB 오탐 확인: 폐기되면 안 됨(urgent는 아님)
  ["반도체 장비주 수주 소식", false],
  ["삼성전자 신제품 발표", false],
];
const { items, dropped } = processArticles(cases.map(([t]) => mk(t)), now);
for (const [t, expectUrgent] of cases) {
  const it = items.find((i) => i.title === t);
  const dr = dropped.find((d) => d.title === t);
  console.log((it ? `통과 ${it.score.total}점 긴급=${it.urgent}` : `폐기(${dr?.reason} ${dr?.detail})`).padEnd(28), "|", t, it && it.urgent !== expectUrgent ? "  ⚠ 기대와 다름" : "");
}
