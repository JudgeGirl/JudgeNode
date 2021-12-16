var connection = require('../mysql').connection;
var helper = require('./helper')
var dbUser = require('./user')
var dbSubmission = require('./submission')

var const_AC = 7;

function finishProblemPromiseByUidAndSid(uid, sid) {
    return new Promise((resolve, reject) => {
		let cmd = 'SELECT S2.sid FROM submissions S1 JOIN submissions S2 ON S1.pid = S2.pid WHERE S1.sid = ? && S2.uid = ? && S2.res = ? LIMIT 1;';
		connection.query(cmd, [sid, uid, const_AC], function(err, result) {
            if (err) {
                reject(err);
                return;
            }

            if (result.length == 1) {
                resolve(true);
                return;
            }

            resolve(false);
		});
    });
}

module.exports = {
    sourceCodeVeiwPrivilege: async function(uid, sid) {
        // allow all admin
        let isAdmin = await helper.getIsAdminPromise(uid);
        if (isAdmin)
            return true;

        // allow user who has passed the problem
        let finishedProblem = await finishProblemPromiseByUidAndSid(uid, sid);
        if (finishedProblem)
            return true;

        let isOwner = (await dbSubmission.promises.getSubmission(sid))[0]["uid"] == uid;
        if (isOwner)
            return true;

        return false;
    },
    problemReportViewPrivilege: async function(uid) {
        if (uid === undefined) {
            return false;
        }

        let user = await dbUser.promises.getUser(uid);
        if (user.length != 1) {
            throw Error(`Invalid uid: ${uid}`)
        }
        user = user[0];

        const privilegeList = [null, '5'];
        if (privilegeList.includes(user['class']))
            return true;
        else
            return false;
    }
};
