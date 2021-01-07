const expect = require('chai').expect;
const { toTemplate, applyTemplate } = require('lib/components/StringTemplate');

describe("string template", async function(){
    it("toTemplate", async function() {
        const template = toTemplate("abc{}def");
        expect(template).to.equal("abc${this.key}def");
    });

    it("applyTemplate", async function() {
        const template = "abc${this.key}def";
        expect(applyTemplate(template, "abc")).to.equal("abcabcdef");
    });
});
