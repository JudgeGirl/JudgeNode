const expect = require('chai').expect;
const fs = require('fs');

const FileResource = require('lib/components/resource/FileResource');

const tmpDir = `${__dirname}/tmp`;
const readFile = `${tmpDir}/read.txt`;
const content = "hello world, 你好 世界";
const writeFile = `${tmpDir}/write.txt`;

describe("test FileResource", async function(){
    before(function() {
        fs.mkdirSync(tmpDir);
        fs.writeFileSync(readFile, content);
    });

    after(function() {
        fs.rmSync(tmpDir, {force: true, recursive: true});
    })

    it("test read", async function(){
        let resource = new FileResource();
        let content = await resource.get(readFile);


        expect(content).to.equal(content);
    });

    it("test read and write", async function(){
        let resource = new FileResource();

        await resource.set(writeFile, content);

        let fileContent = await resource.get(writeFile);

        expect(fileContent).to.equal(content);
    });
});
