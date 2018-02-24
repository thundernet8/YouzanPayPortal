import * as sqlite3 from "sqlite3";
import * as path from "path";
import * as fs from "fs";
import getLogger from "../utils/logger";
import IOrder from "../interface/IOrder";

export default class SqliteService {
    private get logger() {
        return getLogger();
    }

    public static init() {
        new SqliteService().maybeInit();
    }

    private get dbFile() {
        let dbName = "";

        switch (process.env.NODE_ENV) {
            case "production":
                dbName = "prod";
                break;
            case "test":
                dbName = "test";
                break;
            default:
                dbName = "dev";
        }

        return path.join(process.cwd(), `./db/${dbName}.db`);
    }

    private getDb() {
        const fullFilepath = this.dbFile;

        const Database =
            process.env.NODE_ENV === "production" ? sqlite3.Database : sqlite3.verbose().Database;

        return new Database(fullFilepath);
    }

    private maybeInit() {
        const fullFilepath = this.dbFile;
        if (!fs.existsSync(fullFilepath)) {
            this.logger.info(
                `DB file is not existed on path ${fullFilepath}, trying to add a new one.`
            );
            const db = this.getDb();
            db.serialize(function() {
                db.run(
                    "CREATE TABLE orders(ID INTEGER PRIMARY KEY  AUTOINCREMENT, ORDERID CHAR(50), QRID INTEGER NOT NULL UNIQUE, PAYMENT INTEGER, STATUS CHAR(50))"
                );
            });

            this.logger.info("Close db now");
            db.close();
        }
    }

    public insertRecord(orderId: string, qrId: number) {
        this.logger.info(`Insert record ORDERID: ${orderId}, QRID: ${qrId}`);
        const db = this.getDb();
        const logger = this.logger;
        return new Promise<number>((resolve, reject) => {
            db.serialize(function() {
                const stmt = db.prepare("INSERT INTO orders VALUES (?, ?, ?, ?, ?)");
                stmt.run([null, orderId, qrId, 0, ""], function(error, lastId) {
                    if (error) {
                        logger.error(error.message || error.toString());
                        stmt.finalize();
                        db.close();
                        reject(error);
                    } else {
                        logger.info(`Query result: insert row with ID: ${lastId}`);
                        stmt.finalize();
                        db.close();
                        resolve(lastId);
                    }
                });
            });
        });
    }

    /**
     * 更新订单将付款信息订单状态保存以便重试推送
     * @param qrId
     * @param payment
     * @param status
     */
    public updateRecord(qrId: number, payment: number, status: string) {
        this.logger.info(`Update record QRID: ${qrId}, PAYMENT: ${payment}, STATUS: ${status}`);
        const db = this.getDb();
        const logger = this.logger;
        return new Promise<any>((resolve, reject) => {
            db.serialize(function() {
                const stmt = db.prepare("UPDATE orders SET PAYMENT=?, STATUS=? WHERE QRID=?");
                stmt.run([payment, status, qrId], function(error, result) {
                    if (error) {
                        logger.error(error.message || error.toString());
                        stmt.finalize();
                        db.close();
                        reject(error);
                    } else {
                        logger.info(
                            `Query result: update row with QRID: ${qrId} and return result: ${result}`
                        );
                        stmt.finalize();
                        db.close();
                        resolve(result);
                    }
                });
            });
        });
    }

    public findRecord(qrId: number) {
        this.logger.info(`Query record by: QRID: ${qrId}`);
        const db = this.getDb();
        const logger = this.logger;
        return new Promise<IOrder>((resolve, reject) => {
            db.get(`SELECT * FROM orders WHERE QRID=${qrId}`, function(error, row) {
                if (error) {
                    logger.error(error.message || error.toString());
                    db.close();
                    reject(error);
                } else {
                    logger.info(
                        row
                            ? `Query result: first row: ${JSON.stringify(row)}`
                            : `Query result: 0 rows`
                    );
                    db.close();
                    resolve(row);
                }
            });
        });
    }
}
