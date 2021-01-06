class ReadOnlyResource {
    get(key) {
        throw new Error('not implemented');
    }
}

module.exports = ReadOnlyResource;
