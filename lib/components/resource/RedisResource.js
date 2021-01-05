'use strict';

const redisClient = require('../RedisClient');

const CacheResource = require('./CacheResource');

class RedisResource extends CacheResource {
    constructor(prefix, expirationTime = 600) {
        super();

        this.prefix = prefix;
        this.expirationTime = expirationTime;
    }

    get(key) {
        let promise = redisClient.getValue(this.getRedisKey(key))
            .then(value => {
                if (value === null)
                    return null;

                return redisClient.refreshKey(this.getRedisKey(key), this.expirationTime)
                    .then(() => value);
            });

        return promise;
    }

    set(key, content) {
        return redisClient.setValue(this.getRedisKey(key), content, this.expirationTime);
    }

    invalid(key) {
        return redisClient.deleteKey(this.getRedisKey(key));
    }

    getRedisKey(key) {
        return `${this.prefix}:${key}`;
    }
}

module.exports = RedisResource;
