// 실행 진입점. 사용법:
//   node scripts/run.ts urgent [--dry]
//   node scripts/run.ts briefing <us-close|kr-close|pre-market> [--dry]
// --dry: 텔레그램으로 보내지 않고 내용만 화면에 보여 주며, 전송 기록도 남기지 않는다.
import { collectArticles } from "../lib/rss.ts";
import { processArticles } from "../lib/score.ts";
import { BRIEFING_TITLES, buildBriefing, buildUrgent, type BriefingKind } from "../lib/summarizer.ts";
import { hashLink, loadSent, saveSent } from "../lib/state.ts";
import { sendTelegram } from "../lib/telegram.ts";

try { process.loadEnvFile(".env"); } catch { /* .env가 없으면 환경 변수만 쓴다 */ }

const MAX_URGENT_PER_RUN = 3;
const args = process.argv.slice(2);
const dry = args.includes("--dry");
const mode = args[0];
const sentFile = process.env.SENT_FILE || ".state/sent.json";

async function main() {
  const now = new Date();
  const { articles, failures } = await collectArticles();
  if (failures.length) console.log(`일부 피드 실패 ${failures.length}건: ${failures.join(" / ")}`);
  if (!articles.length) throw new Error("기사를 하나도 가져오지 못했습니다. (알림은 보내지 않음)");
  const { items } = processArticles(articles, now);
  console.log(`수집 ${articles.length}건 → 통과 ${items.length}건`);

  if (mode === "urgent") {
    const sent = loadSent(sentFile, now.getTime());
    const fresh = items.filter((i) => i.urgent && !sent[hashLink(i.link)]).slice(0, MAX_URGENT_PER_RUN);
    console.log(`긴급 대상 ${fresh.length}건 (이미 보낸 것 제외)`);
    for (const it of fresh) {
      const text = buildUrgent(it);
      if (dry) console.log("[시험] 보낼 내용:\n" + text + "\n");
      else {
        await sendTelegram(text);
        sent[hashLink(it.link)] = now.getTime();
        saveSent(sentFile, sent); // 한 건 보낼 때마다 기록해 중복을 막는다
      }
    }
  } else if (mode === "briefing") {
    const kind = args[1] as BriefingKind;
    if (!(kind in BRIEFING_TITLES)) throw new Error("briefing 뒤에는 us-close, kr-close, pre-market 중 하나를 적어 주세요.");
    const text = buildBriefing(kind, items, now);
    if (dry) console.log("[시험] 보낼 내용:\n" + text);
    else await sendTelegram(text);
  } else {
    throw new Error("사용법: urgent 또는 briefing <us-close|kr-close|pre-market> [--dry]");
  }
  console.log(dry ? "시험 실행 완료 (전송 안 함)" : "완료");
}

main().catch((e) => {
  console.error("실패:", e instanceof Error ? e.message : "알 수 없는 오류");
  process.exit(1);
});
