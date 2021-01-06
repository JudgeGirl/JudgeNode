const expect = require('chai').expect;

const ToJsonConverter = require('lib/components/resource/resourceConverter/ToJsonConverter');
const FromJsonConverter = require('lib/components/resource/resourceConverter/FromJsonConverter');

describe("resource converter", function(){
    it("ToJsonConverter", function(){
        let converter = new ToJsonConverter();

        expect(converter.convert([123])).to.equal('[123]');
    });

    it("FromJsonConverter", function(){
        let converter = new FromJsonConverter();

        expect(converter.convert('[123]')).to.deep.equal([123]);
    });
});
