try { process.loadEnvFile(".env"); } catch { /* 무시 */ }
const t = process.env.TELEGRAM_BOT_TOKEN ?? "";
const get = async (m: string) => (await (await fetch(`https://api.telegram.org/bot${t}/${m}`)).json()) as { ok: boolean; result?: Record<string, unknown> };
const me = await get("getMe");
console.log("봇 이름:", me.result?.username, "/ 표시이름:", me.result?.first_name);
const wh = await get("getWebhookInfo");
console.log("웹훅 설정 여부:", wh.result?.url ? "설정됨" : "없음", "/ 대기 중 업데이트:", wh.result?.pending_update_count);
const up = await get("getUpdates");
console.log("받은 업데이트 수:", (up.result as unknown as unknown[])?.length);
export {};
