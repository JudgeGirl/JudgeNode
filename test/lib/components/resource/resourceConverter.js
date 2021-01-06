const expect = require('chai').expect;

const ToJsonConverter = require('lib/components/resource/resourceConverter/ToJsonConverter');
const FromJsonConverter = require('lib/components/resource/resourceConverter/FromJsonConverter');
const StaticResource = require('lib/components/resource/StaticResource');

describe("resource converter", function () {
    it("ToJsonConverter", function () {
        let converter = new ToJsonConverter();

        expect(converter.convert([123])).to.equal('[123]');
    });

    it("FromJsonConverter", function () {
        let converter = new FromJsonConverter();

        expect(converter.convert('[123]')).to.deep.equal([123]);
    });

    it("In resource.", async function() {
        let resource = new StaticResource('[123]');
        resource.setOutputConverter(new FromJsonConverter());

        let content = await resource.get();
        expect(content).to.deep.equal([123]);

        resource.setOutputConverter();
        resource.setInputConverter(new ToJsonConverter());
        await resource.set(null, [123]);
        content = await resource.get();
        expect(content).to.equal('[123]');
    });
});
