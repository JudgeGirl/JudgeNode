const FileLocator = require('./FileLocator');

class TemplateFileLocator extends FileLocator {
    constructor(prefix, suffix) {
        super();

        this.prefix = prefix;
        this.suffix = suffix;
    }

    getFilePath(key) {
        return `${this.prefix}${key}${this.suffix}`;
    }
}

module.exports = TemplateFileLocator;
