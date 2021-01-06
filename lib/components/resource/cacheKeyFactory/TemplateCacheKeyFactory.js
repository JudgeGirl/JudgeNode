const CacheKeyFactory = require('./CacheKeyFactory');

class TemplateCacheKeyFactory extends CacheKeyFactory {
    constructor(prefix, suffix) {
        super();

        this.prefix = prefix;
        this.suffix = suffix;
    }

    getCacheKey(index) {
        return `cache-${this.prefix}:${index}${this.suffix}`;
    }
}

module.exports = TemplateCacheKeyFactory;
