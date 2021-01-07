const expect = require('chai').expect;

const StaticResource = require('lib/components/resource/StaticResource');
const MarkdownPageResource = require('lib/components/resource/MarkdownPageResource');

const MDContent = 'markdown content';
const HTMLContent = 'html content';

function getMarkdownPageResource() {
    let markdownResource = new StaticResource(MDContent);
    let htmlResource = new StaticResource(HTMLContent);
    let markdownPageResource = new MarkdownPageResource(htmlResource, markdownResource);

    return markdownPageResource;
}

describe("markdown page resource", async function(){
    it('markdown page resource', async function() {
        let resource = getMarkdownPageResource();
        let result;
        result = await resource.getMD();
        expect(result).to.equal(MDContent);
        result = await resource.getHTML();
        expect(result).to.equal(HTMLContent);

        let newMDContent = 'markdown content';
        await resource.setMD(null, newMDContent);
        result = await resource.getMD();
        expect(result).to.equal(MDContent);

        let newHTMLContent = 'html content';
        await resource.setHTML(null, newHTMLContent);
        result = await resource.getHTML();
        expect(result).to.equal(newHTMLContent);
    });
});
