const ResourceConverter = require('./ResourceConverter');
const { loggerFactory } = require('lib/components/logger/LoggerFactory');

const logger = Symbol('logger');

class TransferNullConverter extends ResourceConverter {
    constructor(defaultValue) {
        super();

        this[logger] = loggerFactory.getLogger(module.id);
        this.defaultValue = defaultValue;
    }

    convert(data) {
        if (data !== null)
            return data;

        return this.defaultValue;
    }
}

module.exports = TransferNullConverter;
