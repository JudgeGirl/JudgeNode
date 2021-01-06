const expect = require('chai').expect;
const fs = require('fs');

const ReadOnlyFileResource = require('lib/components/resource/ReadOnlyFileResource');
const FileResource = require('lib/components/resource/FileResource');
const RawFileLocator = require('lib/components/resource/fileLocator/RawFileLocator');

const tmpDir = `${__dirname}/tmp`;
const readFile = `${tmpDir}/read.txt`;
const content = "hello world, 你好 世界";
const writeFile = `${tmpDir}/write.txt`;
const fileLocator = new RawFileLocator();

describe("Resource", async function(){
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
});
