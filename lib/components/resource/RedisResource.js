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
        return redisClient.getValue(this.getRedisKey(key));
    }

    set(key, content) {
        return redisClient.setValue(this.getRedisKey(key), content);
    }

    invalid(key) {
        return redisClient.deleteKey(this.getRedisKey(key));
    }

    getRedisKey(key) {
        return `${this.prefix}-${key}`;
    }
}

module.exports = RedisResource;
