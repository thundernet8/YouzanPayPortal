import YouzanPayService from "../service/youzanPayService";
import logger from "../utils/logger";

export default class PaymentController {
    /**
     * 请求生成收款二维码
     */
    public async genPayQr(ctx, _next) {
        const payService = new YouzanPayService();
        try {
            const { name, price, order_id } = ctx.body;
            const result = payService.createQrCode(name, price, order_id);
            if (!result) {
                throw new Error("Create payment qrcode failed");
            }
            ctx.status = 200;
            ctx.type = "application/json";
            ctx.body = JSON.stringify(result);
        } catch (error) {
            logger.error(error);
            ctx.status = 500;
            ctx.body = error.message || error.toString();
        }
    }
}
