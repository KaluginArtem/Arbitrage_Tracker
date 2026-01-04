import { bootstrap } from "./app";

bootstrap().catch(err => {
  console.error("Fatal error", err);
  process.exit(1);
});
