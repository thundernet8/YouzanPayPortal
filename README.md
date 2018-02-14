<div align="center">

## YouzanQrPayPortal

**利用有赞云和有赞微小店实现个人收款解决方案 .**

[![GitHub issues](https://img.shields.io/github/issues/thundernet8/YouzanPayPortal.svg)](https://github.com/thundernet8/YouzanPayPortal/issues)
[![GitHub forks](https://img.shields.io/github/forks/thundernet8/YouzanPayPortal.svg)](https://github.com/thundernet8/YouzanPayPortal/network)
[![GitHub stars](https://img.shields.io/github/stars/thundernet8/YouzanPayPortal.svg)](https://github.com/thundernet8/YouzanPayPortal/stargazers)
[![dependency status](https://img.shields.io/david/thundernet8/YouzanPayPortal.svg?maxAge=3600&style=flat)](https://david-dm.org/thundernet8/YouzanPayPortal)
[![Build Status](https://travis-ci.org/thundernet8/YouzanPayPortal.svg?branch=master)](https://travis-ci.org/thundernet8/YouzanPayPortal)
[![GitHub license](https://img.shields.io/github/license/thundernet8/YouzanPayPortal.svg)](https://github.com/thundernet8/YouzanPayPortal/blob/master/LICENSE)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

</div>

<br>

## Intro

利用有赞云和有赞微小店实现个人收款解决方案, 提供如下两个服务:

* 代理简化生成收款二维码的 API，支持微信支付宝扫描付款
* 接收有赞云的交易消息推送并处理(需要二次请求交易详情)，简化订单状态通知到指定的服务器

核心原理是提供了一个支付中转层，将自有商户订单与有赞云的订单绑定起来，实现支付状态更新

为什么做成单独的服务:

* 方便对接任何系统
* 状态推送可以更灵活的自定义
* 单独服务模式维护减少对原有系统影响

## Usage

### 有赞云端

* 注册[有赞云](https://console.youzanyun.com/register) 开发者

* 创建[有赞微小店](https://h5.youzan.com/v2/index/wxdpc) 并扫码下载相应 APP 便于后续管理资金，注意这个小店在有赞后台看不到，只有 APP 可见

* 应用授权-有赞云控制台创建自用型应用并授权刚创建的店铺，在[推送服务]设置中设置推送网址*http://www.example.com/api/status* , 同时勾选下方的交易消息选项。

### 本服务

* 启动服务配置环境参数，复制`envrc.sample`为`envrc`并填写

其中:

`YOUZANYUN_CLIENT_ID`: 有赞云应用的 client_id

`YOUZANYUN_CLIENT_SECRET`: 有赞云应用的 client_secret

`YOUZAN_KDT_ID`: 有赞云应用绑定的微小店 ID

`SELF_SECRET`: 自有订单系统接收本服务推送数据的加盐 secret

`PUSH_API`: 自有订单系统接收本服务推送数据的地址

```
npm run start // 启动服务
npm run list // 查看服务列表及状态
npm run stop // 停止服务
```

* 提供公网服务，请使用 Nginx 代理至 Node Server，这样能够让有赞推送消息到达推送网址

### 自有订单系统端

* 接入自有商店订单系统，支付时请求服务生成收款二维码

    * 接口地址示例: `http://www.example.com/api/payment/qrcode`
    * 调用方法 `POST application/json`
    * 请求数据 `name`: 商品名, `price`: 价格(分), `order_id`: 自有系统的订单号
    * 返回数据 
        * 1. 正常情况 `qr_id`: 二维码 ID; `qr_url`: 有赞系统内支付地址(不推荐使用，需要付费者注册有赞); `qr_code`: Base64 图片数据，可直接作为 img 的 src 使用 
        * 2. 异常情况 `null`


    ```curl
    curl -X POST -H 'Content-type: application/json' --data '{"name":"test name", "price": 1, "order_id": "your orderid"}' http://www.example.com/api/payment/qrcode
    ```

* 接收状态推送自有订单系统提供一个`PUSH_API`地址接收数据推送，数据格式如下:

    ```json
    {
        "tradeNo": "E20180201105656001353613-6377801",
        "orderId": "1515174485676262",
        "payment": 10,
        "status": "TRADE_SUCCESS",
        "sign": "c857c0f8d52ae9713a77b5c07dda93dc",
        "time": "1517457474"
    }
    ```

    其中 sign 是`time`,`tradeNo`,`orderId`,`payment`,`status`,`SELF_SECRET`使用"|"拼接字符串的 MD5 特征值，请在状态接收端按此逻辑进行校验数据合法性

    此外 status 的 enum 如下:

    ```typescript
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
    ```

    一般处理`TRADE_SUCCESS`和`TRADE_CLOSED`即可，返回 200 状态表示处理成功

## TODO

* [ ] 推送失败重推
