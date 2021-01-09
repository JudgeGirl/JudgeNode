const ResourceConverter = require('./ResourceConverter');
const { loggerFactory } = require('lib/components/logger/LoggerFactory');

class LineToListConverter extends ResourceConverter {
    constructor() {
        super();
        this.logger = loggerFactory.getLogger(module.id);
    }

    convert(data) {
        this.logger.debug(`Input.`, { data });
        if (data === null)
            return [];

        if (typeof data !== 'string')
            throw new Error('data should be a string.');

        const trimmed = data.trim();
        if (trimmed === '')
            return [];

        const segments = trimmed.split('\n');
        const result = segments.map(str => str.trim());

        this.logger.debug(`Convert data.`, { result });

        return result;
    }
}

module.exports = LineToListConverter;
