const CacheKeyFactory = require('./CacheKeyFactory');

class StaticCacheKeyFactory extends CacheKeyFactory {
    constructor(tag, staticKey) {
        super();

        this.staticKey = staticKey;
        this.tag = tag;
    }

    getCacheKey() {
        return `cache-${this.tag}:${this.staticKey}`;
    }
}

module.exports = StaticCacheKeyFactory;
