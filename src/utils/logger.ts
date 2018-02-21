import * as winston from "winston";
import * as path from "path";
import * as moment from "moment";

function getLogger() {
    const daySuffix = moment().format("YYYY-MM-DD");
    const errorLogFile = path.join(process.cwd(), `./logs/error-${daySuffix}.log`);
    const warnLogFile = path.join(process.cwd(), `./logs/warn-${daySuffix}.log`);
    const infoLogFile = path.join(process.cwd(), `./logs/info-${daySuffix}.log`);
    const combinedLogFile = path.join(process.cwd(), `./logs/combined-${daySuffix}.log`);

    const logger = winston.createLogger({
        level: "info",
        format: winston.format.json(),
        transports: [
            new winston.transports.File({ filename: errorLogFile, level: "error" }),
            new winston.transports.File({ filename: warnLogFile, level: "warn" }),
            new winston.transports.File({ filename: infoLogFile, level: "info" }),
            new winston.transports.File({ filename: combinedLogFile })
        ]
    });

    if (process.env.NODE_ENV !== "production") {
        logger.add(
            new winston.transports.Console({
                format: winston.format.simple()
            })
        );
    }

    return logger;
}

export default getLogger;
