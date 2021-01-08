const MorganLogger = require('morgan');
const rotatinFileSystem = require('rotating-file-stream');
const config = require('lib/config').config;
const moment = require('moment');

class LoggerFactory {
    getAccessLogMiddleware() {
        const logOption = {
            size: "5M",
            interval: '1d',
            path: config.HOST.log_path,
            compress: "gzip"
        };
        let accessLogStream = rotatinFileSystem.createStream('access.log', logOption);
        let handler = (tokens, req, res) => {
            return [
                moment().format('YYYY-MM-DDTHH:mm:ss'),
                tokens.method(req, res),
                tokens.url(req, res),
                tokens.status(req, res),
                req.session.uid,
                tokens['remote-addr'](req, res).replace('::ffff:', '')
            ].join(' ')
        };

        let logger = MorganLogger(handler, { stream: accessLogStream });
        return logger;
    }
}

module.exports = { loggerFactory: new LoggerFactory() };
