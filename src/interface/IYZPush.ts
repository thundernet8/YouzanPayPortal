import YZPushType from "../enum/YZPushType";
import YZBusinessStatus from "../enum/YZBusinessStatus";

/**
 * 有赞推送消息结构
 * https://www.youzanyun.com/docs/guide/3401/3449
 */
export default interface IYZPush {
    mode: number;
    id: string;
    client_id: string;
    type: YZPushType;
    status: YZBusinessStatus;
    msg: string;
    kdt_id: number;
    sign: string;
    version: number;
    test: boolean;
    send_count: number;
}
