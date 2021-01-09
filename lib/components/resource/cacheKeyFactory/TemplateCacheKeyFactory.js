const CacheKeyFactory = require('./CacheKeyFactory');
const { toTemplate, applyTemplate } = require('lib/components/StringTemplate');
// const { loggerFactory } = require('lib/components/logger/LoggerFactory');

// const logger = Symbol('logger');

class TemplateCacheKeyFactory extends CacheKeyFactory {
    constructor(tag, template) {
        super();

        this.template = toTemplate(`cache-${tag}:${template}`);
        // this[logger] = loggerFactory.getLogger(module.id);
    }

    getCacheKey(index) {
        let key = applyTemplate(this.template, index);

        return key;
    }
}

module.exports = TemplateCacheKeyFactory;
