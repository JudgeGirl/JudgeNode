const ResourceConverter = require('./ResourceConverter');

class CompositeConverter extends ResourceConverter {
    constructor(...converterList) {
        super();

        this.converterList = converterList;
    }

    convert(data) {
        for (const converter of this.converterList) {
            data = converter.convert(data);
        }

        return data;
    }
}

module.exports = CompositeConverter;
