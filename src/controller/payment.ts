export default class PaymentController {
    /**
     * Reuqest to generate a payment QrCode
     */
    public async genPayQr(ctx, _next) {
        ctx.status = 200;
        ctx.body = "ok";
    }
}
