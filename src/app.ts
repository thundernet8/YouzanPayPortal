import * as Koa from "koa";
import * as cors from "@koa/cors";
import * as compress from "koa-compress";
import * as bodyParser from "koa-bodyparser";
import getLogger from "./utils/logger";
import {
    SERVER_HOST,
    SERVER_PORT,
    YOUZAN_CLIENT_ID,
    YOUZAN_CLIENT_SECRET,
    YOUZAN_KDT_ID,
    SELF_SECRET,
    PUSH_API
} from "./env";
import router from "./router";
import SqliteService from "./service/sqliteService";

if (!YOUZAN_CLIENT_ID || !YOUZAN_CLIENT_SECRET || !YOUZAN_KDT_ID || !SELF_SECRET || !PUSH_API) {
    throw new Error(`Please check envrc file and fill required fields`);
}

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
    getLogger().error(error.message || error.toString());
});

app.listen(SERVER_PORT, SERVER_HOST, () => {
    SqliteService.init();
    getLogger().info(`Server Is Listening at http://${SERVER_HOST}:${SERVER_PORT}`);
});
