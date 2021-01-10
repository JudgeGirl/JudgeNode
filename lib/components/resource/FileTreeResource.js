const ReadOnlyResource = require('./ReadOnlyResource');
const fs = require('graceful-fs');
const { loggerFactory } = require('lib/components/logger/LoggerFactory');

const moduleLogger = loggerFactory.getLogger(module.id);

function isDirectory(file) {
    return new Promise((resolve, reject) => {
        fs.stat(file, (err, stat) => {
            if (err)
                reject(err);

            resolve(stat && stat.isDirectory());
        });
    });
}

function listDirectory(dir) {
    return new Promise((resolve, reject) => {
        fs.readdir(dir, (err, fileList) => {
            if (err)
                reject(err);

            resolve(fileList);
        });
    })
}

async function traverseDirectory(dir, level) {
    let result = [];
    let fileList;

    if (level == 0)
        return [];

    try {
        fileList = await listDirectory(dir);
    } catch (err) {
        moduleLogger.debug('List directory err.', { err });
        if (err.code === "ENOENT")
            return null;

        throw err;
    }

    for (const file of fileList) {
        let currentFile = dir + '/' + file;

        if (await isDirectory(currentFile)) {
            let subDirTree = await traverseDirectory(currentFile, level - 1);
            result = result.concat(subDirTree);

            continue;
        }

        // currentFile = currentFile.substr(skipLength); // remove source list path
        result.push(currentFile);
    }

    moduleLogger.silly(`Traverse ${dir}.`, { result });

    return result;
}

class FileTreeResource extends ReadOnlyResource {
    constructor(fileLocator, maxLevel = 3) {
        super();

        this.fileLocator = fileLocator;
        this.maxLevel = maxLevel;
    }

    getImplementation(key) {
        let file = this.fileLocator.getFilePath(key);

        moduleLogger.silly(`root = ${file}`);

        return traverseDirectory(file, this.maxLevel);
    }
}

module.exports = FileTreeResource;
