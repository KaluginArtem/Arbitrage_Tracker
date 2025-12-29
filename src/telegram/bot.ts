import { Telegraf } from "telegraf";
import { CONFIG } from "../config";

export function makeBot(): Telegraf {
  if (!CONFIG.TELEGRAM.TOKEN) {
    throw new Error("TELEGRAM_BOT_TOKEN missing");
  }
  return new Telegraf(CONFIG.TELEGRAM.TOKEN);
}
