'use strict';

const fs = require('graceful-fs');

const Resource = require("./Resource");

function readFile(file, encoding) {
    return new Promise((resolve, reject) => {
        fs.readFile(file, encoding, (err, content) => {
            if (err) {
                reject(err);
                return;
            }

            resolve(content);
        });
    });
}

function writeFile(file, encoding, content) {
    return new Promise((resovle, reject) => {
        fs.writeFile(file, content, encoding, err => {
            if (err) {
                reject(err);
                return;
            }

            resovle(true);
        });
    });
}

class FileResource extends Resource {
    constructor(root, encoding = "utf8") {
        super();

        this.root = root;
        this.encoding = encoding;
    }

    get(key) {
        return readFile(this.getFilePath(key), this.encoding);
    }

    set(key, content) {
        return writeFile(this.getFilePath(key), this.encoding, content);
    }

    getFilePath(key) {
        return `${this.root}/${key}`;
    }
}

module.exports = FileResource;
