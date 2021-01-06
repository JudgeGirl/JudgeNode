const Resource = require('./Resource');

class CacheResource extends Resource {
    invalidateKey(key) {
        throw new Error('not implemented');
    }
}

module.exports = CacheResource;
