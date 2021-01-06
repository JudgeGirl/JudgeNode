const expect = require('chai').expect;

const CachedResource = require('lib/components/resource/CachedResource');
const DictionaryCacheResource = require('lib/components/resource/DictionaryCacheResource');
const StaticCacheKeyFactory = require('lib/components/resource/cacheKeyFactory/StaticCacheKeyFactory');

const key = 'test-cached-resource';
const cacheKeyFactory = new StaticCacheKeyFactory(key);

describe("cached resource", async function(){
    it("CachedResource", async function(){
        let sourceResource = new DictionaryCacheResource(cacheKeyFactory);
        let cacheResource = new DictionaryCacheResource(cacheKeyFactory);
        let resource = new CachedResource(sourceResource, cacheResource);
        let content1 = 'hello';
        let content2 = 'world';

        await sourceResource.set(null, content1);
        expect(await cacheResource.get()).to.equal(null);
        expect(await resource.get()).to.equal(content1);
        expect(await cacheResource.get()).to.equal(content1);

        await resource.set(null, content2);
        expect(await cacheResource.get()).to.equal(null);
        expect(await sourceResource.get()).to.equal(content2);
        expect(await resource.get()).to.equal(content2);
        expect(await cacheResource.get()).to.equal(content2);
    });
});
