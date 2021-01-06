const CacheResource = require('./CacheResource');

class DictionaryCacheResource extends CacheResource {
    constructor(cacheKeyFactory) {
        super();

        this.cacheKeyFactory = cacheKeyFactory;
        this.data = {};
    }

    get(key) {
        let cacheKey = this.cacheKeyFactory.getCacheKey(key);

        if (cacheKey in this.data) {
            return Promise.resolve(this.data[cacheKey]);
        }

        return Promise.resolve(null);
    }

    set(key, content) {
        let cacheKey = this.cacheKeyFactory.getCacheKey(key);

        this.data[cacheKey] = content;

        return Promise.resolve(true);
    }

    invalidateKey(key) {
        let cacheKey = this.cacheKeyFactory.getCacheKey(key);

        if (cacheKey in this.data)
            delete this.data[cacheKey];

        return Promise.resolve(true);
    }

    refreshKey(key) {
        return Promise.resolve(true);
    }
}

module.exports = DictionaryCacheResource;
