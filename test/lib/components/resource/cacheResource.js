const expect = require('chai').expect;

const RedisCacheResource = require('lib/components/resource/RedisCacheResource');
const DictionaryCacheResource = require('lib/components/resource/DictionaryCacheResource');
const StaticCacheKeyFactory = require('lib/components/resource/cacheKeyFactory/StaticCacheKeyFactory');
const { redisClient } = require('lib/components/RedisClient');

const cacheKeyFactory = new StaticCacheKeyFactory('test-redis-cache');
const content = 'hello 你好';

describe("cache resources", async function() {
    it("RedisCacheResource", async function() {
        await redisClient.deleteKey(cacheKeyFactory.getCacheKey());

        let response;
        let resource = new RedisCacheResource(cacheKeyFactory, 100);
        response = await resource.get();
        expect(response).to.equal(null);

        await resource.set(null, content);
        response = await resource.get();
        expect(response).to.equal(content);

        await resource.refreshKey();

        await redisClient.deleteKey(cacheKeyFactory.getCacheKey());
    });

    it('DictionaryCacheResource', async function() {
        let resource = new DictionaryCacheResource(cacheKeyFactory);
        let response;

        response = await resource.get();
        expect(response).to.equal(null);

        await resource.set(null, content);
        response = await resource.get();
        expect(response).to.equal(content);

        await resource.invalidateKey();
        response = await resource.get();
        expect(response).to.equal(null);
    })
});
