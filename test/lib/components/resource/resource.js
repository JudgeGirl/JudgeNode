const expect = require('chai').expect;
const fs = require('fs');

const ReadOnlyFileResource = require('lib/components/resource/ReadOnlyFileResource');
const FileResource = require('lib/components/resource/FileResource');
const StaticResource = require('lib/components/resource/StaticResource');
const RawFileLocator = require('lib/components/resource/fileLocator/RawFileLocator');

const tmpDir = `${__dirname}/tmp`;
const readFile = `${tmpDir}/read.txt`;
const content = "hello world, 你好 世界";
const writeFile = `${tmpDir}/write.txt`;
const fileLocator = new RawFileLocator();

describe("resources", async function(){
    before(function() {
        fs.mkdirSync(tmpDir);
        fs.writeFileSync(readFile, content);
    });

    after(function() {
        fs.rmSync(tmpDir, {force: true, recursive: true});
    })

    it("ReadOnlyFileResource", async function(){
        let resource = new ReadOnlyFileResource(fileLocator);
        let content = await resource.get(readFile);

        expect(content).to.equal(content);
    });

    it("FileResource", async function(){
        let resource = new FileResource(fileLocator);

        await resource.set(writeFile, content);
        let fileContent = await resource.get(writeFile);

        expect(fileContent).to.equal(content);
    });

    it('StaticResource', async function() {
        let resource = new StaticResource(content);
        let staticContent = await resource.get();
        expect(staticContent).to.equal(content);

        let newContent = 'marko polo';
        await resource.set(undefined, newContent);
        staticContent = await resource.get();
        expect(staticContent).to.equal(newContent);
    });
});
