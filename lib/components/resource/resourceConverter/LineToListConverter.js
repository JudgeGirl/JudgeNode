const ResourceConverter = require('./ResourceConverter');

class LineToListConverter extends ResourceConverter {
    convert(data) {
        if (data === null)
            return [];

        if (typeof data !== 'string')
            throw new Error('data should be a string.');

        const trimmed = data.trim();
        if (trimmed === '')
            return [];

        const segments = trimmed.split('\n');
        const result = segments.map(str => str.trim());

        return result;
    }
}

module.exports = LineToListConverter;
