const connection = require('../../lib/mysql').connection;
const db = {};

const getQueryResult = (resolve, reject) => {
    return function(err, result) {
        if (err)
            reject(err)
        else
            resolve(result);
    };
}

db.getUserByUid = function(uid) {
    const cmd = `

SELECT 			*
FROM 			users
WHERE 			uid = ?;

`.trim();

    const paramList = [uid];

    return new Promise((resolve, reject) => {
        connection.query(cmd, paramList, getQueryResult(resolve, reject));
    });
}

db.getUserByClassList = function(classList) {
    const cmd = `

SELECT 			*
FROM 			users
WHERE 			class in (?);

`.trim();

    const paramList = [classList];

    return new Promise((resolve, reject) => {
        connection.query(cmd, paramList, getQueryResult(resolve, reject));
    });
}

db.getFinalScore = function(eidList, uid) {
    const cmd = `

SELECT 			*
FROM 			exam_scores
NATURAL JOIN 	users
WHERE 			uid = ?
				and 	eid in (?);

`.trim();

    const paramList = [uid, eidList];

    return new Promise((resolve, reject) => {
        connection.query(cmd, paramList, getQueryResult(resolve, reject));
    });
}

module.exports = db;
