const config = require("./config");

const {
    parseCSV,
    readFilePromise,
    finishWithError,
    writeCSV
} = require("../tool");

const toInfoFilename = (filename, config) => {
    return `c${config.courseYear}/${filename}.csv`;
};

const readClassInfo = (filename, config) => {
    let file = readFilePromise(filename)
        .then(parseCSV)
        .catch(finishWithError);

    return file;
};

const getGrade = (filename, config) => {
    let file = readFilePromise(filename)
        .then(parseCSV)
        .catch(finishWithError);

    return file;
}

const getClassInfo = function(classInfo, config) {
    return Promise.all(classInfo.map(function(filename) {

        return readClassInfo(filename, config);
    }));
};

const getGradeDic = async (gradeFile, config) => {
    let gradeInfo = await getGrade(gradeFile, config);

    let gradeDic = {};
    let studentIdIndex = 1;
    let GPAIndex = 2;

    gradeInfo['body'].forEach(row => {
        let studentId = row[studentIdIndex];

        gradeDic[studentId] = row[GPAIndex];
    });

    return gradeDic;
}

const fillGrade = gradeDic => {
    return function(classInfo) {
        let studentGPAIndex = 4;
        let studentIdIndex = 2;

        for (row of classInfo['body']) {
            // console.log(row);
            let studentId = row[studentIdIndex];
            if (!(studentId in gradeDic)) {
                continue;
            }

            let GPA = gradeDic[studentId];
            row[studentGPAIndex] = GPA;
        }

        return classInfo;
    };
}

const toOutputFileName = (name, config) => `c${config.courseYear}/${name}-grade.csv`;

const writeFile = function(gradeList) {
    gradeList.forEach(grade => {
        console.log(grade);
        writeCSV(grade['header'], grade['body'], grade['output']);
    });
};

async function main(config) {
    let classList = ['class-1', 'class-2'];
    let fileNameList = classList.map(name => toInfoFilename(name, config));
    let gradeList = await getClassInfo(fileNameList);

    // console.log(gradeList[0]['body']);

    let gradeFile = `c${config.courseYear}/final-grade.csv`;
    let gradeDic = await getGradeDic(gradeFile, config);

    // console.log(gradeDic);

    gradeList = gradeList.map(fillGrade(gradeDic));
    for (i in gradeList) {
        gradeList[i]['output'] = toOutputFileName(classList[i], config);
    }

    writeFile(gradeList);

    // console.log(gradeList[1]['body']);

    process.exit(0);
}

main(config);
