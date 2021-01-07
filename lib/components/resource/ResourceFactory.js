const TemplateCacheKeyFactory = require('./cacheKeyFactory/TemplateCacheKeyFactory');
const DictionaryCacheResource = require('./DictionaryCacheResource');
const MarkdownPageResource = require('./MarkdownPageResource');

class ResourceFactory {
    createTestMarkdownPageResource() {
        const mdResource = new DictionaryCacheResource(new TemplateCacheKeyFactory('test', '{}.md'));
        const htmlResource = new DictionaryCacheResource(new TemplateCacheKeyFactory('test', '{}.html'));

        return new MarkdownPageResource(htmlResource, mdResource);
    }
}

module.exports = new ResourceFactory();
