import * as Winston from "winston";
import {log_prefix} from "./lib.json";

const format = ({ level, message, label, timestamp }) => `[${timestamp}][${label}] ${level}: ${message}`;

const logger = Winston.createLogger({
    format: Winston.format.combine(
        Winston.format.colorize(),
        Winston.format.label({ label: log_prefix }),
        Winston.format.timestamp({ format: 'DD-MM-YYYY HH:mm:ss' }),
        Winston.format.printf(format)
    ),

    transports: [
        new Winston.transports.Console()
    ]
});

export default logger;