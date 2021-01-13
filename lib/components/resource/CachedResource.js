const Resource = require('./Resource');
const { loggerFactory } = require('lib/components/logger/LoggerFactory');

const logger = Symbol('logger');

class CachedResource extends Resource {
    constructor(sourceResource, cacheResource, autoRefresh = true) {
        super();

        this.sourceResource = sourceResource;
        this.cacheResource = cacheResource;
        this.autoRefresh = autoRefresh;
        this[logger] = loggerFactory.getLogger(module.id);
    }

    async getImplementation(key) {
        let cached = await this.cacheResource.get(key);

        if (this.autoRefresh && cached !== null) {
            await this.cacheResource.refreshKey(key);

            return Promise.resolve(cached);
        }

        // Failover to sourceResource.
        let content = await this.sourceResource.get(key);
        this[logger].silly('From source resource.', { content });

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
