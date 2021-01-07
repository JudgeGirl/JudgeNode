const { redisClient } = require('../RedisClient');

const CacheResource = require('./CacheResource');

class RedisResource extends CacheResource {
    constructor(cacheKeyFactory, expirationTime = 600) {
        super();

        this.cacheKeyFactory = cacheKeyFactory;
        this.expirationTime = expirationTime;

        this.redisClient = redisClient;
    }

    get(key) {
        return this.redisClient.getValue(this.cacheKeyFactory.getCacheKey(key));
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
