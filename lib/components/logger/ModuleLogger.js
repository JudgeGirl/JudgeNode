const { createLogger, format, transports } = require('winston');
const { colorize, combine, printf, timestamp, padLevels, errors, logstash } = format;
require('winston-daily-rotate-file');

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

const fileLogTransport = new transports.DailyRotateFile({
    filename: '%DATE%-module.log',
    dirname: config.LOG.path,
    zippedArchive: true,
    maxFiles: '30d',
    level: config.LOG.level.file,
    format: combine(
        timestamp(),
        errors({ stack: true }),
        logstash()
    )
});

const winstonLogger = createLogger({
    transports: [
        fileLogTransport,
        new transports.Console({
            format: combine(
                errors({ stack: true }),
                timestamp({ format: 'hh:mm:ss.SSS A' }),
                formatMessage(),
                padLevels(),
                colorize(),
                stdoutFromat
            ),
            level: config.LOG.level.stdout
        })
    ],
});

if (process.env.NODE_ENV === 'test') {
    winstonLogger.transports.forEach(transport => {
        transport.silent = true;
    })
}

module.exports = { winstonLogger };
