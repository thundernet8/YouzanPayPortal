import * as sqlite3 from "sqlite3";
import * as path from "path";
import * as fs from "fs";
import logger from "../utils/logger";
import IOrder from "../interface/IOrder";

export default class SqliteService {
    public constructor() {
        this.init();
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

    private init() {
        const fullFilepath = this.dbFile;
        if (!fs.existsSync(fullFilepath)) {
            logger.info(`DB file is not existed on path ${fullFilepath}, trying to add a new one.`);
            const db = this.getDb();
            db.serialize(function() {
                db.run(
                    "CREATE TABLE orders(ID INTEGER PRIMARY KEY  AUTOINCREMENT, ORDERID CHAR(50) NOT NULL, QRID INTEGER NOT NULL UNIQUE)"
                );
            });

            logger.info("Close db now");
            db.close();
        }
    }

    public insertRecord(orderId: string, qrId: number) {
        logger.info(`Insert record ORDERID: ${orderId}, QRID: ${qrId}`);
        const db = this.getDb();
        return new Promise<number>((resolve, reject) => {
            db.serialize(function() {
                const stmt = db.prepare("INSERT INTO orders VALUES (?, ?, ?)");
                stmt.run([null, orderId, qrId], function(error, lastId) {
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

    public findRecord(qrId: number) {
        logger.info(`Query record by: QRID: ${qrId}`);
        const db = this.getDb();
        return new Promise<IOrder>((resolve, reject) => {
            db.get("SELECT * FROM orders", function(error, row) {
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
