import * as path from "path";

// Init process.env
require("dotenv").config({ path: path.resolve(process.cwd(), "./envrc") });

export const IS_PROD = process.env.NODE_ENV === "production";

// Server
export const SERVER_HOST = IS_PROD ? "127.0.0.1" : "127.0.0.1";
export const SERVER_PORT = IS_PROD ? 8601 : 8601;

// Youzan
export const YOUZAN_CLIENT_ID = process.env.YOUZANYUN_CLIENT_ID || "";
export const YOUZAN_CLIENT_SECRET = process.env.YOUZANYUN_CLIENT_SECRET || "";
export const YOUZAN_KDT_ID = process.env.YOUZAN_KDT_ID || ""; // 店铺id
export const SELF_SECRET = process.env.SELF_SECRET || "";

// 推送目标服务器地址
export const PUSH_API = process.env.PUSH_API || "";
