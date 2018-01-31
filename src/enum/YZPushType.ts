enum YZPushType {
    // 订单状态事件
    TRADE_ORDER_STATE = "TRADE_ORDER_STATE",
    // 退款事件
    TRADE_ORDER_REFUND = "TRADE_ORDER_REFUND",
    // 物流事件
    TRADE_ORDER_EXPRESS = "TRADE_ORDER_EXPRESS",
    // 商品状态事件
    ITEM_STATE = "ITEM_STATE",
    // 商品基础信息事件
    ITEM_INFO = "ITEM_INFO",
    // 积分
    POINTS = "POINTS",
    // 会员卡（商家侧）
    SCRM_CARD = "SCRM_CARD",
    // 会员卡（用户侧）
    SCRM_CUSTOMER_CARD = "SCRM_CUSTOMER_CARD",
    // 交易V1
    TRADE = "TRADE",
    // 商品V1
    ITEM = "ITEM"
}

export default YZPushType;
