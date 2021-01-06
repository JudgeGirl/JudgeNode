const Resource = require('./Resource');

class CachedResource extends Resource {
    constructor(sourceResource, cacheResource) {
        super();

        this.sourceResource = sourceResource;
        this.cacheResource = cacheResource;
    }

    async getImplementation(key) {
        let cached = await this.cacheResource.get(key);

        if (cached !== null) {
            await this.cacheResource.refreshKey(key);
            return Promise.resolve(cached);
        }

        // Failover to sourceResource.
        let content = await this.sourceResource.get(key);

        if (content !== null) {
            await this.cacheResource.set(key, content);
        }

        return Promise.resolve(content);
    }

    async setImplementation(key, content) {
        await this.cacheResource.invalidateKey(key);
        await this.sourceResource.set(key, content);
    }
}

module.exports = CachedResource;
