const parse = require('csv-parse');
const config = require("./config");
const {
    colorConsole,
    toRawScoreFilename,
    readFilePromise,
    writeFileSync,
    parseCSV,
    renameFile
} = require("../tool");

function buildMergeTask(weekdayTag, mergeIndex) {
    let file1Prefix = toRawScoreFilename(config.path, config.weekNumber, weekdayTag);
    let file1 = `${file1Prefix}_${mergeIndex[0]}.csv`;
    let file2 = `${file1Prefix}_${mergeIndex[1]}.csv`;

    // default output file is xxx_0.csv
    let outputFile = `${file1Prefix}_0.csv`;
    return [file1, file2, outputFile];
}

async function doTask(file1, file2, outputFile) {
    let score1 = readCSVFilePromise(file1);
    let score2 = readCSVFilePromise(file2);

    let result = await Promise.all([score1, score2])
        .then(mergeScore)
        .then(renameFile(outputFile, outputFile + ".before_merge"))
        .then(writeScoreFile(outputFile));

    return result;
}

async function doTaskList(mergeList) {
    let taskNum = mergeList.length;
    for (let task of mergeList) {
        await doTask(task[0], task[1], task[2]);
    }

    colorConsole('INFO', `success; finish merge(${taskNum})`, 'green');
    process.exit(0);
}


const printOut = data => {
    console.log(data);
}

const readCSVFilePromise = filename => {
    colorConsole('INFO', `read file: ${filename}`, 'green');
    return readFilePromise(filename)
        .then(parseCSV);
};

const mergeScore = csvList => {
    let result = {};
    for (row of csvList[0].body) {
        let uid = row[0];
        let lgn = row[1];
        let score = parseFloat(row[3]);

        if (!result.hasOwnProperty(uid)) {
            result[uid] = [uid, lgn, 0, score];
        }
    }

    for (row of csvList[1].body) {
        let uid = row[0];
        let lgn = row[1];
        let score = parseFloat(row[3]);

        if (!result.hasOwnProperty(uid)) {
            result[uid] = [uid, lgn, 0, score];
        } else {
            result[uid][3] = result[uid][3] + score;
        }
    }

    colorConsole("INFO", 'done merge', 'green');

    return {
        header: ['uid', 'lgn', 'pid', 'score'],
        body: Object.values(result)
    };
}

const writeScoreFile = function(outputFile) {
    return function(result) {
        let text = result.header.join(', ');
        for (row of result.body) {
            text += '\n' + row.join(', ');
        }

        writeFileSync(outputFile, text);
        colorConsole('INFO', `write file: ${outputFile}`, 'green');
    }
};

let mergeList = [];
if (config.merge.Mon.length != 0) {
    let mergeIndex = config.merge.Mon;
    mergeList.push(buildMergeTask('mon', mergeIndex));
}

if (config.merge.Tue.length != 0) {
    let mergeIndex = config.merge.Tue;
    mergeList.push(buildMergeTask('tue', mergeIndex));
}


doTaskList(mergeList);
