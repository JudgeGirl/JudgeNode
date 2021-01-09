const { redisClient } = require('../RedisClient');

const CacheResource = require('./CacheResource');
const { loggerFactory } = require('lib/components/logger/LoggerFactory');

class RedisResource extends CacheResource {
    constructor(cacheKeyFactory, expirationTime = 600) {
        super();

        this.cacheKeyFactory = cacheKeyFactory;
        this.expirationTime = expirationTime;
        this.redisClient = redisClient;
        this.logger = loggerFactory.getLogger(module.id);
    }

    get(key) {
        return this.redisClient.getValue(this.cacheKeyFactory.getCacheKey(key))
            .then(value => {
                if (value !== null) {
                    this.logger.debug(`Cache hit on ${this.cacheKeyFactory.getCacheKey(key)}.`);
                }

                return value;
            });
    }

    set(key, content) {
        return this.redisClient.setValue(this.cacheKeyFactory.getCacheKey(key), content, this.expirationTime);
    }

    invalidateKey(key) {
        return this.redisClient.deleteKey(this.cacheKeyFactory.getCacheKey(key));
    }

    refreshKey(key) {
        return this.redisClient.refreshKey(this.cacheKeyFactory.getCacheKey(key), this.expirationTime);
    }
}

module.exports = RedisResource;
