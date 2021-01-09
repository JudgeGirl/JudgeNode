const { createLogger, format, transports } = require('winston');
const { colorize, combine, printf, timestamp, padLevels, errors, logstash } = format;

const config = require('lib/config').config;

const stdoutFromat = printf(({ level, message, timestamp, stack }) => {
    // If its an error, append the error call stack.
    if (stack)
        message = `${message}\n${stack}`;

    return `${timestamp} ${level} ${message}`;
});

const formatMessage = format(info => {
    const { message, label } = info;
    info['message'] = `[${label}] ${message}`;

    return info;
})

const stdoutLevel = config.JUDGE.env === 'production' ? 'info' : 'debug';
const logToFileLevel = config.JUDGE.env === 'production' ? 'warn' : 'silly';
const winstonLogger = createLogger({
    transports: [
        new transports.File({
            format: combine(
                timestamp(),
                errors({ stack: true }),
                logstash()
            ),
            filename: 'info.log',
            level: logToFileLevel
        }),
        new transports.Console({
            format: combine(
                errors({ stack: true }),
                timestamp({ format: 'hh:mm:ss.SSS A' }),
                formatMessage(),
                padLevels(),
                colorize(),
                stdoutFromat
            ),
            level: stdoutLevel
        })
    ],
});

module.exports = { winstonLogger };
