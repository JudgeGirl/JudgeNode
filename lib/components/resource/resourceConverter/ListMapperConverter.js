const ResourceConverter = require('./ResourceConverter');

class ListMapperConverter extends ResourceConverter {
    constructor(mapper) {
        super();

        this.mapper = mapper;
    }

    convert(data) {
        if (data === null)
            return null;

        if (!Array.isArray(data))
            throw Error('ListMapperConverter only task arrays or null.');

        return data.map(this.mapper);
    }
}

module.exports = ListMapperConverter;
