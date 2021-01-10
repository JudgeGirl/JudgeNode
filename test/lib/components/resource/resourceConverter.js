const expect = require('chai').expect;

const ToJsonConverter = require('lib/components/resource/resourceConverter/ToJsonConverter');
const FromJsonConverter = require('lib/components/resource/resourceConverter/FromJsonConverter');
const LineToListConverter = require('lib/components/resource/resourceConverter/LineToListConverter');
const ListMapperConverter = require('lib/components/resource/resourceConverter/ListMapperConverter');
const FilterListConverter = require('lib/components/resource/resourceConverter/FilterListConverter');
const CompositeConverter = require('lib/components/resource/resourceConverter/CompositeConverter');
const TransferNullConverter = require('lib/components/resource/resourceConverter/TransferNullConverter');

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

    it("ListMapperConverter", function () {
        const content = ['aaa', 'aab', 'aac'];
        const mapper = element => element.slice(2);
        const converter = new ListMapperConverter(mapper);

        expect(converter.convert(content)).to.deep.equal(['a', 'b', 'c']);
        expect(converter.convert([])).to.deep.equal([]);
        expect(converter.convert(null)).to.equal(null);
        expect(() => converter.convert('string')).to.throw();
        expect(() => converter.convert()).to.throw();
    });

    it('LineToListConverter in resource.', async function() {
        const lines = 'set.c\nset.h\n';
        const resource = new StaticResource(lines);
        resource.setOutputConverter(new LineToListConverter());

        expect(await resource.get()).to.deep.equal(['set.c', 'set.h']);
    });

    it("TransferNullConverter", function () {
        let converter = new TransferNullConverter([]);

        expect(converter.convert('a')).to.equal('a');
        expect(converter.convert([])).to.deep.equal([]);
        expect(converter.convert(123)).to.equal(123);
        expect(converter.convert(null)).to.deep.equal([]);

        converter = new TransferNullConverter('');
        expect(converter.convert('a')).to.equal('a');
        expect(converter.convert([])).to.deep.equal([]);
        expect(converter.convert(123)).to.equal(123);
        expect(converter.convert(null)).to.equal('');
    });

    it("FilterListConverter", function () {
        const filterList = [
            123,
            'abc',
            null
        ];

        let converter = new FilterListConverter(filterList);
        let content = ['123', 123, 'ab', 'abc', null, 0];
        expect(converter.convert(content)).to.deep.equal(['123', 'ab', 0]);
        expect(converter.convert([123])).to.deep.equal([]);
        expect(() => converter.convert(null)).to.throw();
        expect(() => converter.convert('')).to.throw();
        expect(() => converter.convert(123)).to.throw();
    });

    it("CompositeConverter", function () {
        const converter = new CompositeConverter(new ToJsonConverter(), new FromJsonConverter());

        let obj = 5;
        expect(converter.convert(obj)).to.equal(obj);
        obj = '';
        expect(converter.convert(obj)).to.equal(obj);
        obj = null;
        expect(converter.convert(obj)).to.equal(obj);
        obj = {};
        expect(converter.convert(obj)).to.deep.equal(obj);
        obj = [];
        expect(converter.convert(obj)).to.deep.equal(obj);
        obj = [123];
        expect(converter.convert(obj)).to.deep.equal(obj);
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
