const FileLocator = require('./FileLocator');

class StaticFileLocator extends FileLocator {
    constructor(staticFile) {
        super();

        this.staticFile = staticFile;
    }

    getFilePath(key) {
        return this.staticFile;
    }
}

module.exports = StaticFileLocator;
