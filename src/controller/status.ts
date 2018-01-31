import YouzanPayService from "../service/youzanPayService";
import logger from "../utils/logger";

export default class StatusController {
    /**
     * 接收来自有赞推送的消息
     */
    public async index(ctx) {
        const data = ctx.request.body;
        const yzPayService = new YouzanPayService();
        logger.info(`Received youzan push message`);
        process.nextTick(yzPayService.handleNotify.bind(yzPayService, data));
        ctx.type = "application/json";
        ctx.body = JSON.stringify({ code: 0, msg: "success" });
        logger.info(`Replied youzan server`);
    }
}
