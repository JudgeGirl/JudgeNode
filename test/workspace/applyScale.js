const fs = require('fs');
const config = require("./config.js");
const parse = require('csv-parse');

const readFile = function(filePath) {
    return fs.readFileSync(filePath).toString();
};

const toScaleLookUp = function(scaleCSV) {
    return new Promise((resolve, reject) => {
        parse(scaleCSV, {comment: '#'}, function(err, output) {
            if (err)
                reject(err);

            const lookup = {};
            const scaleList = output.slice(1);

            for (let i in scaleList) {
                [lgn, uid, scale] = scaleList[i];
                lookup[uid] = { lgn, uid, scale: parseFloat(scale)};
            }

            resolve(lookup);
        });
    });
}

const readScaleFile = function(filePath) {
    return new Promise(resolve => {
        resolve(readFile(filePath));
    });
};

const readResultFile = function(filePath) {
    return function(lookup) {
        return new Promise(resolve => {
            const file = readFile(filePath);

            resolve({ lookup, resultCSV: file });
        });
    };
};

const parseResult = function(payload) {
    return new Promise((resolve, reject) => {
        parse(payload.resultCSV, {comment: "#"}, function(err, output) {
            if (err)
                reject(err);

            const result = [];
            const resultList = output.slice(1);
    
            for (let i in resultList) {
                [uid, lgn, score] = resultList[i];
                result.push({ uid, lgn, score: parseFloat(score) });
            }

            resolve({ lookup: payload.lookup, result });
        });
    });
};

const applyScale = function(payload) {
    return new Promise((resolve, reject) => {
        const scaledResult = [];
        const lookupKeyList = Object.keys(payload.lookup);

        for (let i in payload.result) {
            let { uid, lgn, score } = payload.result[i];
            if (!lookupKeyList.includes(uid))
                reject("missing row in scale lookup");

            let scale = payload.lookup[uid].scale;

            scaledResult.push({
                uid,
                lgn,
                scaledScore: scale * score
            });
        }

        resolve(scaledResult);
    });
};

const outputFile = filename => {
    return scaledResult => {
        return new Promise(resolve => {
            const header = ["uid", "lgn", "score"];
            
            let text = header.join(",");
            for (let i in scaledResult) {
                const obj = scaledResult[i];
                let line = [
                    obj.uid, 
                    obj.lgn, 
                    obj.scaledScore
                ].join(",");

                text += "\n" + line;
            }

            fs.writeFileSync(filename, text);
            resolve("success");
        });
    }
};

const printResult = result => {
    console.log(result);
    process.exit(0);
};

const scaleLookUp = readScaleFile(config.path + "/" + config.scale.filename)
    .then(toScaleLookUp)
    .then(readResultFile(config.path + "/" + config.result.filename))
    .then(parseResult)
    .then(applyScale)
    .then(outputFile(config.path + "/" + config.scaledResult.filename))
    .then(printResult)
    .catch(err => {
        console.log("ERROR: " + err);
        process.exit(-1);
    });
