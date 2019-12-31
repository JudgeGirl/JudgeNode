const fs = require('fs');

const connection = require('../../../lib/mysql').connection;

const config = require("./config.js");

const buildSql = function(config) {
    // build variable
    const mConfig = config.scale["Mon"], tConfig = config.scale["Tue"];
    const mProblemList = "(" + mConfig.problemList.join(", ") + ")";
    const tProblemList = "(" + tConfig.problemList.join(", ") + ")";


    // build query
    const cmd = `

SELECT  U.uid, U.lgn, if(coalesce(max(S.scr), 0) >= ${mConfig.passLimit},
            ${mConfig.passScale}, ${mConfig.failScale}) as scale
FROM    users U
LEFT JOIN   (
    SELECT *
    FROM    submissions S
    WHERE   S.pid in ${mProblemList}
            && (S.ts / 1000) < unix_timestamp(timestamp("${mConfig.deadline}"))
) as S
    ON U.uid = S.uid
WHERE   U.class = ${mConfig.studentClass}
GROUP BY    U.lgn

UNION
SELECT  U2.uid, U2.lgn, if(coalesce(max(S2.scr), 0) >= ${tConfig.passLimit},
            ${tConfig.passScale}, ${tConfig.failScale}) as scale
FROM    users U2
LEFT JOIN   (
    SELECT *
    FROM    submissions S2
    WHERE   S2.pid in ${tProblemList}
            && (S2.ts / 1000) < unix_timestamp(timestamp("${tConfig.deadline}"))
) as S2
    ON U2.uid = S2.uid
WHERE   U2.class = ${tConfig.studentClass}
GROUP BY    U2.lgn
ORDER BY    lgn;

`.trim();

    return cmd;
};

const buildLookup = function(res) {
    const result = {};

    for (let i in res) {
        let uid = res[i].uid
        result[uid] = {
            scale: res[i].scale,
            lgn: res[i].lgn
        };
    }

    return result;
};

const queryDb = function(cmd) {
    return new Promise((resolve) => {
        const handle = (err, result) => {
            if (err)
                resolve(err);
            resolve(result);
        };
        connection.query(cmd, [], handle);
    });
};

const display = function(value) {
    console.log(value);
	process.exit(0);
};

const writeCsvFile = function(record) {
    const header = ["lgn", "uid", "scale"];
    let text = '';

    text = header.join(",");
    for (let i in record) {
        let obj = record[i]
        text += "\n" + [obj.lgn, obj.uid, obj.scale].join(",");
    }

    return new Promise(resolve => {
        let filename = `${config.path}/${config.scale.filename}`;
        fs.writeFileSync(filename, text);
        resolve("success!");
    });
};

let cmd = buildSql(config);
queryDb(cmd)
    .then(writeCsvFile)
    .then(display)
    .catch(err => console.log(err));
