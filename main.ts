import { Application } from "oak";
import { oakCors } from "cors";
import router from "./routes/index.ts";
import { logger } from "./util/logger.ts";
import { CONFIG } from "./util/config.ts";

const port = CONFIG.PORT;

const app = new Application();
app.use(oakCors()); // Enable CORS for All Routes

app.use(async (ctx, next) => {
  try {
    await next();
  } catch (e) {
    ctx.response.status = e.status || 500;
    ctx.response.body = { error: e.message };
  }
});

app.use(router.routes());
app.use(router.allowedMethods());

logger.debug(`Listening on port ${port}`);
await app.listen({ port });
