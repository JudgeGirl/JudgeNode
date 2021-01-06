const fs = require('graceful-fs');

const ReadOnlyFileResource = require('./ReadOnlyFileResource');

function writeFile(file, encoding, content) {
    return new Promise((resolve, reject) => {
        fs.writeFile(file, content, encoding, err => {
            if (err) {
                reject(err);
                return;
            }

            resolve(true);
        });
    });
}

class FileResource extends ReadOnlyFileResource {
    constructor(fileLocator, encoding = 'utf8') {
        super(fileLocator, encoding);
    }

    set(key, content) {
        return writeFile(this.fileLocator.getFilePath(key), this.encoding, content);
    }
}

module.exports = FileResource;
