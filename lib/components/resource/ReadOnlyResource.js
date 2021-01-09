const { loggerFactory } = require('lib/components/logger/LoggerFactory');

const logger = Symbol('logger');

class ReadOnlyResource {
    constructor() {
        this.outputConverter = undefined;
        this[logger] = loggerFactory.getLogger(module.id);
    }

    setOutputConverter(converter) {
        this.outputConverter = converter;
    }

    get(key) {
        this[logger].debug('get from resource.', { key });

        if (this.outputConverter === undefined)
            return this.getImplementation(key);

        return this.getImplementation(key)
            .then(value => this.outputConverter.convert(value));
    }

    getImplementation(key) {
        throw new Error('not implemented');
    }
}

module.exports = ReadOnlyResource;
