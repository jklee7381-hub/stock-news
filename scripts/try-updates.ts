try { process.loadEnvFile(".env"); } catch { /* 무시 */ }
const t = process.env.TELEGRAM_BOT_TOKEN ?? "";
const j = (await (await fetch(`https://api.telegram.org/bot${t}/getUpdates`)).json()) as { result?: Record<string, unknown>[] };
for (const u of j.result ?? []) {
  const kind = Object.keys(u).find((k) => k !== "update_id");
  const body = u[kind as string] as { chat?: { id: number; type: string; title?: string; first_name?: string }; text?: string } | undefined;
  console.log(kind, body?.chat ? `chat ${body.chat.id} ${body.chat.type} ${body.chat.title ?? body.chat.first_name ?? ""}` : "");
}
export {};
