'use strict';

const ResourceManager = require('./ResourceManager');

class PageContextDecorator extends ResourceManager {
    constructor(resourceManager) {
        super(null, null);

        this.resourceManager = resourceManager;
    }

    get(key) {
        return this.resourceManager.get(key);
    }

    set(key, content) {
        return this.resourceManager.set(key, content);
    }

    getHTML(key) {
        return this.resourceManager.get(`${key}.html`);
    }

    setHTML(key, content) {
        return this.resourceManager.set(`${key}.html`, content);
    }

    getMD(key) {
        return this.resourceManager.get(`${key}.md`);
    }

    setMD(key, content) {
        return this.resourceManager.set(`${key}.md`, content);
    }
}

module.exports = PageContextDecorator;
