import YouzanPayService from "../service/youzanPayService";
import getLogger from "../utils/logger";

export default class StatusController {
    private get logger() {
        return getLogger();
    }

    /**
     * 接收来自有赞推送的消息
     */
    public async index(ctx) {
        const data = ctx.request.body;
        const yzPayService = new YouzanPayService();
        this.logger.info(`Received youzan push message`);
        process.nextTick(yzPayService.handleNotify.bind(yzPayService, data));
        ctx.type = "application/json";
        ctx.body = JSON.stringify({ code: 0, msg: "success" });
        this.logger.info(`Replied youzan server`);
    }
}
