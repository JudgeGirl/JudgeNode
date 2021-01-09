const TemplateCacheKeyFactory = require('./cacheKeyFactory/TemplateCacheKeyFactory');
const StaticCacheKeyFactory = require('./cacheKeyFactory/StaticCacheKeyFactory');

const StaticFileLocator = require('./fileLocator/StaticFileLocator');
const TemplateFileLocator = require('./fileLocator/TemplateFileLocator');

const LineToListConverter = require('lib/components/resource/resourceConverter/LineToListConverter');
const ToJsonConverter = require('lib/components/resource/resourceConverter/ToJsonConverter');
const FromJsonConverter = require('lib/components/resource/resourceConverter/FromJsonConverter');

const FileResource = require('./FileResource');
const ReadOnlyFileResource = require('./ReadOnlyFileResource');
const DictionaryCacheResource = require('./DictionaryCacheResource');
const RedisCacheResource = require('./RedisCacheResource');
const CachedResource = require('./CachedResource');
const MarkdownPageResource = require('./MarkdownPageResource');

const { config } = require('lib/config');

function createGeneralMarkdownPageResource(cacheKeyTag, rootPath) {
    let cacheResource;
    let cacheKeyFactory;
    let fileLocator;
    let fileResource;

    let mdResource;
    // md resource
    fileLocator = new TemplateFileLocator(`${rootPath}/md/{}.md`);
    fileResource = new FileResource(fileLocator);

    cacheKeyFactory = new TemplateCacheKeyFactory(cacheKeyTag, '{}.md');
    cacheResource = new RedisCacheResource(cacheKeyFactory);

    mdResource = new CachedResource(fileResource, cacheResource);

    let htmlResource;
    // html resource
    fileLocator = new TemplateFileLocator(`${rootPath}/{}.html`);
    fileResource = new FileResource(fileLocator);

    cacheKeyFactory = new TemplateCacheKeyFactory(cacheKeyTag, '{}.html');
    cacheResource = new RedisCacheResource(cacheKeyFactory);

    htmlResource = new CachedResource(fileResource, cacheResource);

    let resource;
    // page resource
    resource = new MarkdownPageResource(htmlResource, mdResource);

    return resource;
}

class ResourceFactory {
    createTestMarkdownPageResource() {
        const mdResource = new DictionaryCacheResource(new TemplateCacheKeyFactory('test', '{}.md'));
        const htmlResource = new DictionaryCacheResource(new TemplateCacheKeyFactory('test', '{}.html'));

        return new MarkdownPageResource(htmlResource, mdResource);
    }

    createAnnouncementResource() {
        let cacheResource;
        let cacheKeyFactory;
        let fileLocator;
        let fileResource;

        // md resource
        let mdResource;
        fileLocator = new StaticFileLocator(`${config.RESOURCE.public.announcement}/announcement.md`);
        fileResource = new FileResource(fileLocator);

        cacheKeyFactory = new StaticCacheKeyFactory('announcement', 'announcement.md');
        cacheResource = new RedisCacheResource(cacheKeyFactory);

        mdResource = new CachedResource(fileResource, cacheResource);

        // html resource
        let htmlResource;
        fileLocator = new StaticFileLocator(`${config.RESOURCE.public.announcement}/announcement.html`);
        fileResource = new FileResource(fileLocator);

        cacheKeyFactory = new StaticCacheKeyFactory('announcement', 'announcement.html');
        cacheResource = new RedisCacheResource(cacheKeyFactory);

        htmlResource = new CachedResource(fileResource, cacheResource);

        // page resource
        let resource;
        resource = new MarkdownPageResource(htmlResource, mdResource);

        return resource;
    }

    createProblemResource() {
        return createGeneralMarkdownPageResource('problem', config.RESOURCE.public.problem);
    }

    createSolutionResource() {
        return createGeneralMarkdownPageResource('solution', config.RESOURCE.public.solution);
    }

    createContestResource() {
        return createGeneralMarkdownPageResource('contest', config.RESOURCE.public.contest);
    }

    createSourceListResource() {
        let cacheResource;
        let cacheKeyFactory;
        let fileLocator;
        let fileResource;

        let resource;
        fileLocator = new TemplateFileLocator(`${config.RESOURCE.testdata}/{}/source.lst`);
        fileResource = new ReadOnlyFileResource(fileLocator);
        fileResource.setOutputConverter(new LineToListConverter());

        cacheKeyFactory = new TemplateCacheKeyFactory('source-list', '{}/source.lst');
        cacheResource = new RedisCacheResource(cacheKeyFactory);
        cacheResource.setInputConverter(new ToJsonConverter());
        cacheResource.setOutputConverter(new FromJsonConverter());

        resource = new CachedResource(fileResource, cacheResource);

        return resource;
    }
}

module.exports = { resourceFactory: new ResourceFactory() };
