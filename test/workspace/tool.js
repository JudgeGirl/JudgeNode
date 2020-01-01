const path = require("path"),
	colors = require('colors'),
    fs = require('fs'),
    parse = require('csv-parse');

const colorConsole = (tag, msg, color) => {
    console.log(`[${tag.padEnd(4, " ")[color]}] ${msg}`);
};

const tool = {};

tool.colorConsole = colorConsole;

tool.cidTag = cid => "C" + cid.padStart(3, "0");

tool.makeSurePathExist = filename => {
    const dir = path.dirname(filename);
    if (!fs.existsSync(dir))
        fs.mkdirSync(dir, { recursive: true });
};

tool.finish = function(err, result) {
    if (err) {
        colorConsole("Error", err, "red");
        process.exit(1);
    }

    colorConsole("INFO", result, "green");
    process.exit(0);
};

tool.readFileSync = function(filePath) {
    let file = fs.readFileSync(filePath);

    return file.toString();
};

tool.writeFileSync = (filename, content) => {
    fs.writeFileSync(filename, content);
};

tool.toRawScoreFilename = (path, weekNumber, weekDay) => `${path}/week${weekNumber}${weekDay}`;

tool.logErr = err => {
    colorConsole("Error", err, "red");
};

tool.readFilePromise = filename => {
    return new Promise(resolve => {
        resolve(tool.readFileSync(filename).toString());
    })
}

tool.parseCSV = function(file) {
    return new Promise(resolve => {
        parse(file, {comment: '#'}, function(err, output) {
            if (err)
                reject(err);

            const lookup = {};
            let csv = {
                head: output.slice(0, 1),
                body: output.slice(1)
            };

            resolve(csv);
        });
    });
};

tool.renameFile = function(src, des) {
    return function(result) {
        fs.renameSync(src, des);

        return result;
    }
};

module.exports = tool;
