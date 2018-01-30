import * as YZClient from "yz-open-sdk-nodejs";
import * as Sign from "../../node_modules/yz-open-sdk-nodejs/Sign";
import { YOUZAN_CLIENT_ID, YOUZAN_CLIENT_SECRET } from "../env";
import logger from "../utils/logger";

export default class YouzanPayService {
    private yzClient = new YZClient(new Sign(YOUZAN_CLIENT_ID, YOUZAN_CLIENT_SECRET));

    public async createQrCode(name: string, price: number, originOrderId: string) {
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
            const data = JSON.parse(resp);
            logger.info(`Generate qrcode: id: ${data.qr_id}, url: ${data.qr_url}`);
        } catch (error) {
            logger.error(error.message || error.toString());
        }
    }
}
