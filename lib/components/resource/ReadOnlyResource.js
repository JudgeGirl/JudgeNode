class ReadOnlyResource {
    constructor() {
        this.outputConverter = undefined;
    }

    setOutputConverter(converter) {
        this.outputConverter = converter;
    }

    get(key) {
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
