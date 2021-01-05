"use strict";
// This is a singleton of redis client.

const redis = require("redis");

class RedisClient {
    constructor() {
        this.client = redis.createClient();
        this.cacheExpireTime = 60 * 60; // In seconds.
    }

    getClient() {
        return this.client;
    }

    getValue(key) {
        return new Promise((resolve, reject) => {
            this.client.get(key, (err, result) => {
                if (err) {
                    reject(err);
                    return;
                }

                resolve(result);
            });
        });
    }

    setValue(key, value) {
        return new Promise((resolve, reject) =>  {
            this.client.setex(key, this.cacheExpireTime, value, (err, result) => {
                if (err) {
                    reject(err);
                    return;
                }

                resolve(result);
            });
        });
    }

    deleteKey(key) {
        return new Promise((resolve, reject) =>  {
            this.client.del(key, (err, result) => {
                if (err) {
                    reject(err);
                    return;
                }

                resolve(result);
            });
        });
    }

    refreshKey(key, expirationTime) {
        return new Promise((resolve, reject) => {
            this.client.expire(key, expirationTime, (err, result) => {
                if (err) {
                    reject(err);
                    return;
                }

                resolve(result);
            });
        });
    }
}

module.exports = new RedisClient();
