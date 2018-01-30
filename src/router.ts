import * as Router from "koa-router";
import PaymentController from "./controller/payment";
import StatusController from "./controller/status";

export default function(app) {
    const router = new Router();
    const payMentontroller = new PaymentController();
    const statusController = new StatusController();

    router.post("/api/payment/qrcode", payMentontroller.genPayQr);

    router.post("/api/status", statusController.index);

    router.get("/test", payMentontroller.testGet);

    router.get("/test2", payMentontroller.test2Get);

    app.use(router.routes()).use(router.allowedMethods());
}
