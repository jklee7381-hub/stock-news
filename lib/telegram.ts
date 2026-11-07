// 텔레그램 전송. 토큰은 환경 변수에서만 읽고, 오류 메시지에도 토큰을 넣지 않는다.
export async function sendTelegram(html: string): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) throw new Error("TELEGRAM_BOT_TOKEN 또는 TELEGRAM_CHAT_ID가 없습니다.");
  // 주소는 api.telegram.org 하나로 고정한다.
  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({ chat_id: chatId, text: html, parse_mode: "HTML", disable_web_page_preview: true }),
    signal: AbortSignal.timeout(10_000),
  }).catch(() => {
    throw new Error("텔레그램에 연결하지 못했습니다.");
  });
  if (!res.ok) {
    let desc = "";
    try { desc = String((await res.json()).description ?? ""); } catch { /* 무시 */ }
    throw new Error(`텔레그램 전송 실패 (HTTP ${res.status}) ${desc.replaceAll(token, "[숨김]")}`.trim());
  }
}
