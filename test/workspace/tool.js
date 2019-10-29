const path = require("path"),
	colors = require('colors'),
    fs = require('fs');

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

tool.writeFileSync = (filename, content) => {
    fs.writeFileSync(filename, content);
};

tool.toRawScoreFilename = (path, weekNumber, weekDay) => `${path}/week${weekNumber}${weekDay}`;

tool.logErr = err => {
    colorConsole("Error", err, "red");
};

module.exports = tool;
