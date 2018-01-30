import SqliteService from "../service/sqliteService";
import logger from "../utils/logger";

export default class PaymentController {
    /**
     * Reuqest to generate a payment QrCode
     */
    public async genPayQr(ctx, _next) {
        ctx.status = 200;
        ctx.body = "ok";
    }

    public async testGet(ctx) {
        const sqliteService = new SqliteService();
        try {
            const result = await sqliteService.findRecord(2);
            ctx.status = 200;
            ctx.body = JSON.stringify(result);
        } catch (error) {
            logger.error(error);
            ctx.status = 500;
            ctx.body = error.message || error.toString();
        }
    }

    public async test2Get(ctx) {
        const sqliteService = new SqliteService();
        try {
            const result = await sqliteService.insertRecord("xx", Math.ceil(Math.random() * 100));
            ctx.status = 200;
            ctx.body = JSON.stringify(result || "");
        } catch (error) {
            logger.error(error);
            ctx.status = 500;
            ctx.body = error.message || error.toString();
        }
    }
}
