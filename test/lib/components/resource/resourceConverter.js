const expect = require('chai').expect;

const ToJsonConverter = require('lib/components/resource/resourceConverter/ToJsonConverter');
const FromJsonConverter = require('lib/components/resource/resourceConverter/FromJsonConverter');
const LineToListConverter = require('lib/components/resource/resourceConverter/LineToListConverter');
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

    it("LineToListConverter", function () {
        let converter = new LineToListConverter();

        expect(converter.convert('a\nb\nc')).to.deep.equal(['a', 'b', 'c']);
        expect(converter.convert('a\nb\nc\n')).to.deep.equal(['a', 'b', 'c']);
        expect(converter.convert('a\n b\nc\n')).to.deep.equal(['a', 'b', 'c']);
        expect(converter.convert('a\n b \nc\n')).to.deep.equal(['a', 'b', 'c']);
        expect(converter.convert('')).to.deep.equal([]);
        expect(converter.convert(null)).to.deep.equal([]);
        expect(() => converter.converter()).to.throw();
        expect(() => converter.converter(123)).to.throw();
    });

    it('LineToListConverter in resource.', async function() {
        const lines = 'set.c\nset.h\n';
        const resource = new StaticResource(lines);
        resource.setOutputConverter(new LineToListConverter());

        expect(await resource.get()).to.deep.equal(['set.c', 'set.h']);
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
