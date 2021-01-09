const { morganLogger } = require('./AccessLogMiddleware');
const { winstonLogger } = require('./ModuleLogger');

function extractModuleId(moduleId) {
    const moduleSegments = moduleId.replace('.js', '').split('/');

    return moduleSegments[moduleSegments.length - 1];
}

function decorateLogger(logger, tag, level) {
    const label = extractModuleId(tag);
    logger[level] = function(msg, vars) {
        if (vars === undefined)
            vars = {};

        vars['label'] = label;
        logger['winstonLogger'].log(level, msg, vars);
    };
}


class LoggerFactory {
    getAccessLogMiddleware() {
        return morganLogger;
    }

    getLogger(tag) {
        const logger = { winstonLogger: winstonLogger };

        Object.keys(winstonLogger.levels).forEach(level => {
            decorateLogger(logger, tag, level);
        });

        return logger;
    }
}

module.exports = { loggerFactory: new LoggerFactory() };
