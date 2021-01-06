const fs = require('graceful-fs');

const ReadOnlyResource = require('./ReadOnlyResource');

function readFile(file, encoding) {
    return new Promise((resolve, reject) => {
        fs.readFile(file, encoding, (err, content) => {
            if (err) {
                if (err.code === 'ENOENT')
                    resolve(null);
                else
                    reject(err);

                return;
            }

            resolve(content);
        });
    });
}

class ReadOnlyFileResource extends ReadOnlyResource {
    constructor(fileLocator, encoding = 'utf8') {
        super();

        this.fileLocator = fileLocator;
        this.encoding = encoding;
    }

    get(key) {
        return readFile(this.fileLocator.getFilePath(key), this.encoding);
    }
}

module.exports = ReadOnlyFileResource;
