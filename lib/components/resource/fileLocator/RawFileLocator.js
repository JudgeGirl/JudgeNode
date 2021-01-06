const FileLocator = require('./FileLocator');

class RawFileLocator extends FileLocator {
    getFilePath(key) {
        return key;
    }
}

module.exports = RawFileLocator;
