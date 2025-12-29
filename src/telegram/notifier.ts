import { Telegraf } from "telegraf";
import { CONFIG } from "../config";

export async function notify(bot: Telegraf, text: string): Promise<void> {
  if (!CONFIG.TELEGRAM.CHAT_ID) {
    throw new Error("TELEGRAM_CHAT_ID missing");
  }
  await bot.telegram.sendMessage(CONFIG.TELEGRAM.CHAT_ID, text, { parse_mode: "Markdown" });
}
