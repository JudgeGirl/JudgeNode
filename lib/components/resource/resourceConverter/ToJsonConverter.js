const ResourceConverter = require('./ResourceConverter');
const { loggerFactory } = require('lib/components/logger/LoggerFactory');

const logger = Symbol('logger');

class ToJsonConverter extends ResourceConverter {
    constructor() {
        super();

        this[logger] = loggerFactory.getLogger(module.id);
    }

    convert(data) {
        let result = JSON.stringify(data);
        this[logger].debug('Convert data.', { result });

        return result;
    }
}

module.exports = ToJsonConverter;
