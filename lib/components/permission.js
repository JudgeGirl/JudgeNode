var connection = require('../mysql').connection;
var helper = require('./helper')
var dbUser = require('./user')

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
    sourceCodeVeiwPrivilege: function(uid, sid) {
        return new Promise(async resolve => {
            // allow all admin
            let isAdmin = await helper.getIsAdminPromise(uid);
            if (isAdmin)
                resolve(true);

            // allow user who has passed the problem
            let finishedProblem = await finishProblemPromiseByUidAndSid(uid, sid);
            if (finishedProblem)
                resolve(true);

            resolve(false);
        });
    },
    problemReportViewPrivilege: function(uid, pid) {
        return new Promise(async resolve => {
            if (uid === undefined) {
                resolve(false);
                return;
            }

            let user = await dbUser.promises.getUser(uid);
            if (user.length != 1) {
                throw Error(`Invalid uid: ${uid}`)
            }
            user = user[0];

            privilegeList = [null, '5'];
            if (privilegeList.includes(user['class']))
                resolve(true);
            else
                resolve(false);
        })
    }
};
