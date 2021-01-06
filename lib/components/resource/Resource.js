const ReadOnlyResource = require('./ReadOnlyResource');

class Resource extends ReadOnlyResource {
    constructor() {
        super();

        this.inputConverter = undefined;
    }

    setInputConverter(converter) {
        this.inputConverter = converter;
    }

    set(key, content) {
        if (this.inputConverter !== undefined)
            content = this.inputConverter.convert(content);

        return this.setImplementation(key, content);
    }

    setImplementation(key, content) {
        throw new Error('not implemented');
    }
}

module.exports = Resource;
