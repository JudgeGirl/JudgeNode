const MorganLogger = require('morgan');
const rotatinFileSystem = require('rotating-file-stream');
const config = require('lib/config').config;
const moment = require('moment');

const missingValue = '-1';

const logOption = {
    size: "5M",
    interval: '1d',
    path: config.LOG.path,
    compress: "gzip",
    maxFiles: 365
};
const accessLogStream = rotatinFileSystem.createStream('access.log', logOption);
const handler = (tokens, req, res) => {
    let contentLength = tokens['res'](req, res, 'content-length') || missingValue;
    let uid = req.session.uid || missingValue;
    return [
        moment().format('YYYY-MM-DDTHH:mm:ss'),
        uid,
        tokens.method(req, res),
        tokens.url(req, res),
        tokens.status(req, res),
        tokens['remote-addr'](req, res).replace('::ffff:', ''),
        tokens['response-time'](req, res),
        contentLength
    ].join(' ');
};

const morganLogger = MorganLogger(handler, { stream: accessLogStream });

module.exports = { morganLogger };
