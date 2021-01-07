const FileLocator = require('./FileLocator');

class TemplateFileLocator extends FileLocator {
    constructor(template) {
        super();

        this.template = template;
    }

    getFilePath(key) {
        return new Function(`return \`${this.template}\`;`).call({ key });
    }
}

module.exports = TemplateFileLocator;
