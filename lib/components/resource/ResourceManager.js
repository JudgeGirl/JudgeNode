'use strict';

class ResourceManager {
    constructor(baseResource, cacheResource) {
        this.baseResource = baseResource;
        this.cacheResource = cacheResource;
    }

    async get(key) {
        let cached = await this.cacheResource.get(key);

        if (cached !== null)
            return cached;

        let content = await this.baseResource.get(key);
        await this.cacheResource.set(key, content);

        return content;
    }

    async set(key, content) {
        await this.cacheResource.invalid(key);
        await this.baseResource.set(key, content);
    }
}

module.exports = ResourceManager;
