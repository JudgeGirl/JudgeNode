const ReadOnlyResource = require('./ReadOnlyResource');

class Resource extends ReadOnlyResource {
    set(key, content) {
        throw new Error('not implemented');
    }
}

module.exports = Resource;
