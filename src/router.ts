import * as Router from "koa-router";
import PaymentController from "./controller/payment";
import StatusController from "./controller/status";

export default function(app) {
    const router = new Router();

    router.get("/api/payment/qrcode", (...args) => {
        const controller = new PaymentController();
        return controller.genPayQr.call(controller, ...args);
    });

    router.post("/api/status", (...args) => {
        const controller = new StatusController();
        return controller.index.call(controller, ...args);
    });

    app.use(router.routes()).use(router.allowedMethods());
}
