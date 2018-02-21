import axios from "axios";
import * as https from "https";
import * as qs from "querystring";
import getLogger from "../utils/logger";
import * as moment from "moment";
import { YOUZAN_CLIENT_ID, YOUZAN_CLIENT_SECRET, YOUZAN_KDT_ID } from "../env";

export default class YouzanTokenService {
    private logger = getLogger();

    /**
     * Memory cache
     */
    private static store: { token: string; expiry: number } = {} as any;

    private setToken(token: string, expiresIn: number) {
        YouzanTokenService.store = {
            token: token,
            expiry: parseInt((moment.now().valueOf() / 1000 + expiresIn).toFixed(0), 10)
        };
    }

    public async getToken() {
        const cache = YouzanTokenService.store;
        if (cache) {
            const { token, expiry } = cache;
            if (token && expiry - moment.now().valueOf() / 1000 > 10 * 60) {
                this.logger.info(`Get token from cache: ${token}`);
                return token;
            }
        }

        const ax = axios.create({
            timeout: 10000,
            withCredentials: false,
            httpsAgent: new https.Agent({
                rejectUnauthorized: false
            }),
            headers: {
                "Content-type": "application/x-www-form-urlencoded"
            }
        });
        const data = {
            client_id: YOUZAN_CLIENT_ID,
            client_secret: YOUZAN_CLIENT_SECRET,
            grant_type: "silent",
            kdt_id: Number(YOUZAN_KDT_ID)
        };

        try {
            this.logger.info(
                `Trying to get access_token with request data: ${JSON.stringify(data)}`
            );
            const resp = await ax.post("https://open.youzan.com/oauth/token", qs.stringify(data));
            if (resp.status !== 200) {
                this.logger.error(
                    `Get access_token request failed with status: ${resp.status} and data: ${
                        resp.data
                    }`
                );
                throw new Error("Get access_token failed");
            }

            this.logger.info(
                `Get access_token request successfully data: ${JSON.stringify(resp.data)}`
            );

            const { access_token, expires_in } = resp.data;
            this.logger.info(`Got access_token: ${access_token}, expires_in: ${expires_in}`);
            this.setToken(access_token, expires_in);
            return access_token as string;
        } catch (error) {
            this.logger.error(
                `Get access_token request failed with message: ${error.message || error.toString()}`
            );
            throw error;
        }
    }
}
