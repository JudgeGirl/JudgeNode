const Resource = require('./Resource');

const { loggerFactory } = require('lib/components/logger/LoggerFactory');

const logger = Symbol('logger');

class CacheResource extends Resource {
    constructor(cacheKeyFactory) {
        super();

        this.cacheKeyFactory = cacheKeyFactory;
        this[logger] = loggerFactory.getLogger(module.id);
    }

    get(key) {
        return super.get(key)
            .then(value => {
                let cacheKey = this.cacheKeyFactory.getCacheKey(key);
                if (value !== null) {
                    this[logger].verbose(`Cache hit on ${cacheKey}.`);
                } else {
                    this[logger].verbose(`Cache miss on ${cacheKey}.`);
                }

                return value;
            });
    }

    set(key, content) {
        return super.set(key, content);
    }

    invalidateKey(key) {
        throw new Error('not implemented');
    }

    refreshKey(key) {
        throw new Error('not implemented');
    }
}

module.exports = CacheResource;
