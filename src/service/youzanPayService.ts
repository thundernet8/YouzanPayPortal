import * as YZClient from "yz-open-sdk-nodejs";
import * as Sign from "../../node_modules/yz-open-sdk-nodejs/Sign";
import * as crypto from "crypto";
import axios from "axios";
import * as https from "https";
import * as qs from "querystring";
import { YOUZAN_CLIENT_ID, YOUZAN_CLIENT_SECRET, SELF_SECRET, PUSH_API } from "../env";
import logger from "../utils/logger";
import IYZPush from "../interface/IYZPush";
import YZPushType from "../enum/YZPushType";
import SqliteService from "./sqliteService";

export default class YouzanPayService {
    private yzClient = new YZClient(new Sign(YOUZAN_CLIENT_ID, YOUZAN_CLIENT_SECRET));

    /**
     * 生成收款二维码
     * @param name 商品名
     * @param price 价格(单位分)
     * @param originOrderId 原有商品系统的订单ID
     */
    public async createQrCode(
        name: string,
        price: number,
        originOrderId: string
    ): Promise<{ qr_id: string; qr_url: string; qr_code: string; qr_type: string } | null> {
        logger.info(
            `Trying create qrcode for product: ${name} with price ${price} and original order id ${originOrderId}`
        );

        price = Math.abs(price);

        const params = {
            qr_name: name,
            qr_price: price,
            qr_type: "QR_TYPE_DYNAMIC"
        };

        try {
            const resp = await this.yzClient.invoke(
                "youzan.pay.qrcode.create",
                "3.0.0",
                "GET",
                params,
                undefined
            );
            const data = JSON.parse(resp.response);
            logger.info(`Generate qrcode: id: ${data.qr_id}, url: ${data.qr_url}`);
            return data;
        } catch (error) {
            logger.error(error.message || error.toString());
            return null;
        }
    }

    public async handleNotify(data: IYZPush) {
        logger.info(`Trying to handle youzan push message: ${JSON.stringify(data || {})}`);
        if (!data || data.test) {
            logger.info(`Ignore youzan pushed test message`);
            return true;
        }

        // 验证消息Sign
        const signStr = YOUZAN_CLIENT_ID + data.msg + YOUZAN_CLIENT_SECRET;
        const md5 = crypto.createHash("md5");
        const sign = md5.update(signStr, "utf8").digest("hex");
        if (sign !== data.sign) {
            logger.error(`Verify push message sign failed, calculated sign: ${sign}`);
            return;
        }

        // 只处理支付消息
        if (data.type !== YZPushType.TRADE_ORDER_STATE) {
            logger.info(`Ignore message with type: ${data.type}`);
            return;
        }

        // 获取订单信息
        if (!data.msg) {
            logger.error(`Invalid message with empty msg field`);
            return;
        }

        try {
            logger.info(`Parsed order info: ${decodeURI(data.msg)}`);
            const orderInfo = JSON.parse(decodeURI(data.msg));
            const qrId = await this.fetchOrderQrId(orderInfo.tid);
            const payment = parseInt((orderInfo.payment * 100).toFixed(0), 10);
            const status = orderInfo.status || data.status;

            // 先更新本地订单记录
            await new SqliteService().updateRecord(qrId, payment, status);

            // 在本地数据库查询对接的原始订单号
            const record = await new SqliteService().findRecord(qrId);

            // 推送数据到原始订单系统
            await this.pushOrder(record.ORDERID, payment, status);
        } catch (error) {
            logger.error(`Parse order info failed: ${error.message || error.toString()}`);
            return;
        }
    }

    /**
     * 通过订单号查询订单详情并返回详情内的qr_id
     * @param tid 有赞订单号
     */
    private async fetchOrderQrId(tid: string) {
        try {
            logger.info(`Fetching detail for order: ${tid}`);

            const params = {
                tid
            };
            const resp = await this.yzClient.invoke(
                "youzan.trade.get",
                "3.0.0",
                "GET",
                params,
                undefined
            );
            const data = JSON.parse(resp.body);
            logger.info(`Fetched order detail: ${JSON.stringify(resp.body)}`);

            const qrId = data.response.trade.qr_id;
            return qrId as number;
        } catch (error) {
            logger.error(`Fetch order detail failed: ${error.message || error.toString()}`);
            return 0;
        }
    }

    private async pushOrder(originOrderId: string, payment: number, status: string) {
        if (!originOrderId) {
            return false;
        }
        const sig = [originOrderId, payment.toString(), status, SELF_SECRET].join("|");
        const data = {
            orderId: originOrderId,
            payment,
            status,
            sign: crypto
                .createHash("md5")
                .update(sig, "utf8")
                .digest("hex")
        };

        try {
            logger.info(`Trying push order to ${PUSH_API}, data: ${JSON.stringify(data)}`);
            const resp = await axios
                .create({
                    timeout: 10000,
                    withCredentials: false,
                    httpsAgent: new https.Agent({
                        rejectUnauthorized: false
                    }),
                    headers: {
                        "Content-type": "application/x-www-form-urlencoded"
                    }
                })
                .post(PUSH_API, qs.stringify(data));

            if (resp.status !== 200) {
                logger.error(
                    `Push order info to ${PUSH_API} with wrong response status ${resp.status}`
                );
                return false;
            } else {
                logger.info(
                    `Push order info to ${PUSH_API} successfully, response ${JSON.stringify(resp)}`
                );
                return true;
            }

            // TODO retry push
        } catch (error) {
            logger.error(
                `Push order info to ${PUSH_API} failed: ${error.message || error.toString()}`
            );
            return false;
        }
    }
}
