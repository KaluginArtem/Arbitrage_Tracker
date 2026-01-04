import { startPipeline } from "./pipeline";

export async function bootstrap() {
  console.log("🚀 Starting arbitrage system");
  await startPipeline();
}
