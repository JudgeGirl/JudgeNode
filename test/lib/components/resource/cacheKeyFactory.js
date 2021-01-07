const expect = require('chai').expect;

const StaticCacheKeyFactory = require('lib/components/resource/cacheKeyFactory/StaticCacheKeyFactory');
const TemplateCacheKeyFactory = require('lib/components/resource/cacheKeyFactory/TemplateCacheKeyFactory');

describe("cache key factories", function(){
    it("StaticCacheKeyFactory", function(){
        const staticKey = 'announcement.md'
        const cacheKeyFactory = new StaticCacheKeyFactory(staticKey);

        let key = "whatever";

        expect(cacheKeyFactory.getCacheKey(key)).to.equal(`cache:${staticKey}`);
    });

    it("TemplateCacheKeyFactory", function(){
        const cacheKeyFactory = new TemplateCacheKeyFactory('problem', '{}.md');

        let key = "50123";

        expect(cacheKeyFactory.getCacheKey(key)).to.equal('cache-problem:50123.md');
    });
});
