const expect = require('chai').expect;

const RawFileLocator = require('lib/components/resource/fileLocator/RawFileLocator');
const StaticFileLocator = require('lib/components/resource/fileLocator/StaticFileLocator');
const TemplateFileLocator = require('lib/components/resource/fileLocator/TemplateFileLocator');

describe("file locators", function(){
    it("RawFileLocator", function(){
        const fileLocator = new RawFileLocator();

        let key = "file-path";

        expect(fileLocator.getFilePath(key)).to.equal(key);
    });

    it("StaticFileLocator", function(){
        const staticFile = 'file.txt'
        const fileLocator = new StaticFileLocator(staticFile);

        let key = "file-path";

        expect(fileLocator.getFilePath(key)).to.equal(staticFile);
    });

    it("TemplateFileLocator", function(){
        const fileLocator = new TemplateFileLocator('path/../${this.key}.extension');

        let key = "name";

        expect(fileLocator.getFilePath(key)).to.equal('path/../name.extension');
    });
});
