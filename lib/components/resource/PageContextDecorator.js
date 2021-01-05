'use strict';

const ResourceManager = require('./ResourceManager');

class PageContextDecorator extends ResourceManager {
    constructor(resourceManager, htmlPrefix = '', mdPrefix = 'md/') {
        super(null, null);

        this.resourceManager = resourceManager;
        this.htmlPrefix = htmlPrefix;
        this.mdPrefix = mdPrefix;
    }

    get(key) {
        return this.resourceManager.get(key);
    }

    set(key, content) {
        return this.resourceManager.set(key, content);
    }

    buildKey(key, prefix, extensionSuffix) {
        if (prefix === '')
            return `${key}${extensionSuffix}`;

        return `${prefix}${key}${extensionSuffix}`;
    }

    getHTML(key) {
        return this.resourceManager.get(this.getHTMLKey(key));
    }

    setHTML(key, content) {
        return this.resourceManager.set(this.getHTMLKey(key), content);
    }

    getHTMLKey(key) {
        return this.buildKey(key, this.htmlPrefix, '.html');
    }

    getMD(key) {
        return this.resourceManager.get(this.getMDKey(key));
    }

    setMD(key, content) {
        return this.resourceManager.set(this.getMDKey(key), content);
    }

    getMDKey(key) {
        return this.buildKey(key, this.mdPrefix, '.md');
    }
}

module.exports = PageContextDecorator;
