const CacheKeyFactory = require('./CacheKeyFactory');
const { toTemplate, applyTemplate } = require('lib/components/StringTemplate');

class TemplateCacheKeyFactory extends CacheKeyFactory {
    constructor(tag, template) {
        super();

        this.template = toTemplate(`cache-${tag}:${template}`);
    }

    getCacheKey(index) {
        return applyTemplate(this.template, index);
    }
}

module.exports = TemplateCacheKeyFactory;
