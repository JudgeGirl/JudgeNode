const expect = require('chai').expect;

const resourceFactory = require('lib/components/resource/ResourceFactory');

describe("resources", async function() {
    it("test create MarkdownPageResource", async function() {
        let resource = resourceFactory.createTestMarkdownPageResource();
        let mdResource = resource.markdownResource;
        let htmlResource = resource.htmlResource;

        await Promise.all([
            resource.setMD('10000', '10000md'),
            resource.setHTML('10000', '10000html')
        ]);

        expect(await resource.getMD('10000')).to.equal('10000md');
        expect(await resource.getMD('10001')).to.equal(null);
        expect(await resource.getHTML('10000')).to.equal('10000html');
        expect(await resource.getHTML('10001')).to.equal(null);
    });
});
