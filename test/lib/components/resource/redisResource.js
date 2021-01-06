const expect = require('chai').expect;

const RedisResource = require('lib/components/resource/RedisResource');
const StaticCacheKeyFactory = require('lib/components/resource/cacheKeyFactory/StaticCacheKeyFactory');
const redisClient = require('lib/components/RedisClient');

const cacheKeyFactory = new StaticCacheKeyFactory('test');
const content = 'hello 你好';

describe("resources", async function(){
    before(async function() {
        await redisClient.deleteKey(cacheKeyFactory.getCacheKey());
    });

    after(async function() {
        await redisClient.deleteKey(cacheKeyFactory.getCacheKey());
    })

    it("redis resource", async function(){
        let response;

        let resource = new RedisResource(cacheKeyFactory, 10);
        response = await resource.get();
        expect(response).to.equal(null);

        await resource.set(null, content);
        response = await resource.get();
        expect(response).to.equal(content);
    });
});
