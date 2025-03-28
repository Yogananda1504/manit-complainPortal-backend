import { createLogger, format, transports } from "winston";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import fs from "fs"; // added import

const __dirname = dirname(fileURLToPath(import.meta.url));
const logDir = join(__dirname, "../logs"); // logs directory path
if (!fs.existsSync(logDir)) {
	fs.mkdirSync(logDir, { recursive: true }); // create logs folder if it doesn't exist
}

const createCustomLogger = (name) => {
	return createLogger({
		level: "info",
		format: format.combine(
			format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
			format.printf(
				({ timestamp, level, message }) =>
					`${timestamp} [${level.toUpperCase()}]: ${message}`
			)
		),
		transports: [
			new transports.File({ filename: join(logDir, `${name}.log`) }), // updated path
			new transports.Console(),
		],
	});
};

export const email_logger = createCustomLogger("emailNotifications");
