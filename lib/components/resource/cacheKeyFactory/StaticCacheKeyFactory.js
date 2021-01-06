const CacheKeyFactory = require('./CacheKeyFactory');

class StaticCacheKeyFactory extends CacheKeyFactory {
    constructor(staticKey) {
        super();

        this.staticKey = staticKey;
    }

    getCacheKey(index) {
        return `cache:${this.staticKey}`;
    }
}

module.exports = StaticCacheKeyFactory;
