import * as Koa from "koa";
import * as cors from "@koa/cors";
import * as compress from "koa-compress";
import * as bodyParser from "koa-bodyparser";
import logger from "./utils/logger";
import { SERVER_HOST, SERVER_PORT } from "./env";
import router from "./router";

const app = new Koa();

// x-response-time
app.use(async (ctx, next) => {
    const start = Date.now();
    await next();
    const ms = Date.now() - start;
    ctx.set("X-Response-Time", `${ms}ms`);
});

app.use(
    compress({
        filter: function(contentType) {
            return /(json|html|text)/i.test(contentType);
        },
        threshold: 2048,
        flush: require("zlib").Z_SYNC_FLUSH
    })
);

app.use(bodyParser({}));

app.use(cors({ credentials: true }));

router(app);

app.on("error", error => {
    logger.error(error.message || error.toString());
});

app.listen(SERVER_PORT, SERVER_HOST, () => {
    logger.info(`Server Is Listening at http://${SERVER_HOST}:${SERVER_PORT}`);
});
