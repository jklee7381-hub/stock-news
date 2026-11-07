// 봇에게 먼저 말을 건 대화방의 chat id를 보여 준다. 토큰은 출력하지 않는다.
try { process.loadEnvFile(".env"); } catch { /* 무시 */ }
const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) { console.log("TELEGRAM_BOT_TOKEN이 없습니다."); process.exit(1); }
const res = await fetch(`https://api.telegram.org/bot${token}/getUpdates`, { signal: AbortSignal.timeout(10000) }).catch(() => null);
if (!res) { console.log("텔레그램에 연결하지 못했습니다."); process.exit(1); }
const j = await res.json() as { ok: boolean; description?: string; result?: { message?: { chat: { id: number; type: string; first_name?: string; title?: string } } }[] };
if (!j.ok) { console.log("실패:", String(j.description ?? "").replaceAll(token, "[숨김]")); process.exit(1); }
const seen = new Map<number, string>();
for (const u of j.result ?? []) if (u.message) seen.set(u.message.chat.id, `${u.message.chat.type} ${u.message.chat.first_name ?? u.message.chat.title ?? ""}`);
if (!seen.size) console.log("받은 메시지가 없습니다. 텔레그램에서 봇에게 아무 말이나 보낸 뒤 다시 실행하세요.");
for (const [id, d] of seen) console.log(`chat id: ${id} (${d})`);

export {};
