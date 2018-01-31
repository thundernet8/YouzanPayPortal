/**
 * 业务状态（只包含交易消息）
 * https://www.youzanyun.com/docs/guide/3401/3455
 */
enum YZBusinessStatus {
    // 等待买家付款
    WAIT_BUYER_PAY = "WAIT_BUYER_PAY",
    // 待确认，包括（待成团：拼团订单、待接单：外卖订单）
    WAIT_CONFIRM = "WAIT_CONFIRM",
    // 等待卖家发货，即:买家已付款
    WAIT_SELLER_SEND_GOODS = "WAIT_SELLER_SEND_GOODS",
    // 等待买家确认收货,即:卖家已发货
    WAIT_BUYER_CONFIRM_GOODS = "WAIT_BUYER_CONFIRM_GOODS",
    // 买家已签收
    TRADE_BUYER_SIGNED = "TRADE_BUYER_SIGNED",
    // 交易成功
    TRADE_SUCCESS = "TRADE_SUCCESS",
    // 交易关闭
    TRADE_CLOSED = "TRADE_CLOSED"
}

export default YZBusinessStatus;
