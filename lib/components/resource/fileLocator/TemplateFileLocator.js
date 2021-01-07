const FileLocator = require('./FileLocator');
const { toTemplate, applyTemplate } = require('lib/components/StringTemplate');

class TemplateFileLocator extends FileLocator {
    constructor(template) {
        super();

        this.template = toTemplate(template);
    }

    getFilePath(key) {
        return applyTemplate(this.template, key);
    }
}

module.exports = TemplateFileLocator;
