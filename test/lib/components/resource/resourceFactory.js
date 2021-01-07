const expect = require('chai').expect;

const { resourceFactory } = require('lib/components/resource/ResourceFactory');

describe("resources", async function() {
    it("test create MarkdownPageResource", async function() {
        let resource = resourceFactory.createTestMarkdownPageResource();

        await Promise.all([
            resource.setMD('10000', '10000md'),
            resource.setHTML('10000', '10000html')
        ]);

        expect(await resource.getMD('10000')).to.equal('10000md');
        expect(await resource.getMD('10001')).to.equal(null);
        expect(await resource.getHTML('10000')).to.equal('10000html');
        expect(await resource.getHTML('10001')).to.equal(null);
    });

    it("test create resource of announcement", async function() {
        let resource = resourceFactory.createAnnouncementResource();

        expect(await resource.getMD()).to.not.equal(null);
        expect(await resource.getHTML()).to.not.equal(null);
        expect(await resource.markdownResource.cacheResource.get()).to.not.equal(null);
        expect(await resource.htmlResource.cacheResource.get()).to.not.equal(null);
    });

    it("test create resource of announcement", async function() {
        let resource = resourceFactory.createProblemResource();

        let pid = '3';

        expect(await resource.getMD(pid)).to.not.equal(null);
        expect(await resource.getHTML(pid)).to.not.equal(null);
        expect(await resource.markdownResource.cacheResource.get(pid)).to.not.equal(null);
        expect(await resource.htmlResource.cacheResource.get(pid)).to.not.equal(null);
    });
});
