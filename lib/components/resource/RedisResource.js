const redisClient = require('../RedisClient');

const CacheResource = require('./CacheResource');

class RedisResource extends CacheResource {
    constructor(cacheKeyFactory, expirationTime = 600) {
        super();

        this.cacheKeyFactory = cacheKeyFactory;
        this.expirationTime = expirationTime;

        this.redisClient = redisClient;
    }

    get(key) {
        let promise = this.redisClient.getValue(this.cacheKeyFactory.getCacheKey(key))
            .then(value => {
                if (value === null)
                    return null;

                return this.redisClient.refreshKey(this.cacheKeyFactory.getCacheKey(key), this.expirationTime)
                    .then(() => value);
            });

        return promise;
    }

    set(key, content) {
        return this.redisClient.setValue(this.cacheKeyFactory.getCacheKey(key), content, this.expirationTime);
    }

    invalidateKey(key) {
        return this.redisClient.deleteKey(this.cacheKeyFactory.getCacheKey(key));
    }
}

module.exports = RedisResource;
