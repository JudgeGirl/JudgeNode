var connection = require('../mysql').connection;

const promise = {
    getBySid: sid => {
        return new Promise((resolve, reject) => {
            let cmd = "select * from reports where sid = ?;"
            let dbCallback = (err, result) => {
                if (err)
                    reject(err);
                else if(result.length == 0)
                    reject('No report found.');
                else
                    resolve(result);
            }
            connection.query(cmd, [sid], dbCallback);
        });
    },
    getProblemReportSubmission: pid => {
        // select the last AC code from the strongs
        return new Promise((resolve, reject) => {
            let cmd = `
SELECT S1.sid as sid, U.lgn as lgn, RP.cyclomatic_complexity as cyclomatic_complexity
FROM submissions S1
LEFT JOIN submissions S2 ON S1.uid = S2.uid AND S1.pid = S2.pid AND S1.res = 7 AND S2.res = 7 AND S1.sid < S2.sid
JOIN users U ON S1.uid = U.uid
JOIN reports RP ON S1.sid = RP.sid
JOIN problems P ON S1.pid = P.pid
WHERE P.pid = ? AND RP.cyclomatic_complexity IS NOT NULL && U.class = 5 AND S2.uid IS NULL AND S1.res = 7
ORDER BY U.lgn;
`.trim();

            let dbCallback = (err, result) => {
                if (err)
                    reject(err);
                else
                    resolve(result);
            }
            connection.query(cmd, [pid], dbCallback);
        });
    },
    // should be in problem module
    getProblem: pid => {
        return new Promise((resolve, reject) => {
            let cmd = "select * from problems where pid = ?;"
            let dbCallback = (err, result) => {
                if (err)
                    reject(err);
                else
                    resolve(result);
            }
            connection.query(cmd, [pid], dbCallback);
        });
    }
}

module.exports = {
    getProblemReport: async function(pid) {
        let problem = await promise.getProblem(pid);
        if (problem.length !== 1)
            throw Error(`Invalud pid: ${pid}.`);
        problem = problem[0];

        let submissionList = await promise.getProblemReportSubmission(pid);
        let sum = 0;
        for (let i = 0; i < submissionList.length; i++) {
            sum += parseInt(submissionList[i]['cyclomatic_complexity']);
        }

        let average_cyclomatic_complexity = submissionList.length == 0 ? 0
            : (sum / submissionList.length);
        let problemReport = {
            title: problem['ttl'],
            pid: pid,
            submission_list: submissionList,
            average_cyclomatic_complexity: average_cyclomatic_complexity
        };

        return problemReport;
    },
    promise
};
