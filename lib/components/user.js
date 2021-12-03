var path = require("path"),
    crypto = require('crypto'),
    escape = require('escape-html'),
    config = require('../config').config;

var connection = require('../mysql').connection;
const { loggerFactory } = require('lib/components/logger/LoggerFactory');

const promises = {
    getUser: uid => {
        return new Promise((resolve, reject) => {
            const cmd = 'SELECT uid, lgn, email, class, ip FROM users WHERE uid = ?';

            connection.query(cmd, [uid], (err, result) => {
                if (err)
                    reject(err);
                else
                    resolve(result);
            })
        });
    },
    getUserByLoginName: loginName => {
        return new Promise((resolve, reject) => {
            const cmd = 'SELECT uid, lgn, email, class, ip FROM users WHERE lgn = ?';

            connection.query(cmd, [loginName], (err, result) => {
                if (err)
                    reject(err);
                else
                    resolve(result);
            })
        });
    },
    userExistsByUid: (uid) => {
        return new Promise((resolve, reject) => {
            const cmd = 'SELECT uid FROM users WHERE uid = ?';

            connection.query(cmd, [uid], (err, result) => {
                if (err)
                    reject(err);
                else if (result.length == 0)
                    resolve(false);
                else
                    resolve(true);
            })
        });
    },
    setPassword: (uid, password) => {
        return new Promise((resolve, reject) => {
            password = crypto.createHash('sha1').update(password).digest('hex');
            const cmd = 'UPDATE users SET pwd = ? WHERE uid = ?';
            connection.query(cmd, [password, uid], (err, result) => {
                if (err)
                    reject(err);
                else if (result.length == 0)
                    resolve(false);
                else
                    resolve(true);
            })
        });
    },
    isAdmin: uid => {
        return new Promise((resolve, reject) => {
            const cmd = 'SELECT null FROM users WHERE uid = ? and class is null';

            connection.query(cmd, [uid], (err, result) => {
                if (err)
                    return reject(err);

                return resolve(result.length > 0);
            })
        });
    },
    getSolvedList: (uid, privateMode) => {
        return new Promise((resolve, reject) => {
            let privateCondition = "";
            if (!privateMode) {
                privateCondition = "WHERE pub = 1";
            }

            const cmd = `
                SELECT pid, ttl as title
                FROM (
                    SELECT pid
                    FROM users
                    NATURAL JOIN submissions
                    WHERE uid = ? AND res = 7
                    GROUP BY uid, pid
                    ORDER BY pid
                ) PID
                NATURAL JOIN problems
                ${privateCondition};
            `.trim();
            connection.query(cmd, [uid], (err, result) => {
                if (err)
                    return reject(err);

                return resolve(result);
            })
        });
    }
};

module.exports = {
    info: function(uid, callback, isSelf) { // show user page
        var cmd = 'SELECT uid, lgn, ip, ts2, motto, nname, class FROM users WHERE uid = ?';
        var user = {};
        connection.query(cmd, [uid], function(err, result) {
            if (err) {
                callback(null)
            }
            user.info = result[0];
            var cmd = 'SELECT pid FROM users NATURAL JOIN submissions WHERE uid = ? AND res = 7 GROUP BY uid, pid ORDER BY pid';
            connection.query(cmd, [uid], function(err, result) {
                user.solve = result;

                var cmd = 'SELECT S.sid, S.ts, S.uid, S.pid, S.cid, S.res, S.scr, S.lng, S.cpu, ';
                cmd += 'S.mem, S.len, U.lgn, P.ttl, U.ip, G.name as guildTitle, G.icon as guildIcon ';
                cmd += ', 1 - ISNULL(RP.sid) as hasReport, S.factor ';
                cmd += 'FROM submissions S ';
                cmd += 'JOIN users U on U.uid = S.uid ';
                cmd += 'JOIN problems P on P.pid = S.pid ';
                cmd += 'LEFT JOIN guilds G on U.gid = G.gid ';
                cmd += 'LEFT JOIN reports RP on RP.sid = S.sid ';
                cmd += 'WHERE U.uid = ? ';

                if (!isSelf){
                        cmd += 'AND P.pub = 1 ';
                }
                cmd += 'ORDER BY sid DESC LIMIT 20 ';
                connection.query(cmd, [uid], function(err, result) {
                    if(err)console.log(err);
                    user.recent = result;
                    callback(user);
                });
            });
        });
    },
    update_login: function(uid, ip, callback) { // update login date & ip
        var time = new Date().getTime();
        var cmd = 'UPDATE users SET ip = ?, ts2 = ? WHERE uid = ?';
        connection.query(cmd, [ip, time, uid], function(err, result) {
            if (err) {
                callback(null)
            }
            callback();
        });
    },
    add_user: function(user, callback) { // register page
        if (user.code != config.Privilege.register_key)
            return callback(0, "Wrong register key.");
        var cmd = 'SELECT uid FROM users WHERE lgn = ?';
        connection.query(cmd, [user.lgn], function(err, result) {
            if (err)
                return callback(0, err);
            if (result.length)
                return callback(0, "Username exists.");
            var val = {
                ts1: Date.now(),
                ts2: Date.now(),
                lgn: user.lgn,
                pwd: crypto.createHash('sha1').update(user.pwd).digest('hex'),
                motto: escape(''),
                email: user.email,
                nname: user.lgn,
                ename: '',
								class: 1
            };
            var cmd = 'INSERT INTO users SET ?';
            connection.query(cmd, [val], function(err, result) {
                if (err) {
                    console.log(err);
                    return callback(0, "SQL Error");
		}
                return callback(1);
            });
        });
    },
    update_info: function(user, callback) { // profile modify
        var cmd = 'UPDATE users SET motto = ? WHERE uid = ?';
        connection.query(cmd, [user.motto, user.uid], function(err, result) {
            if (err) {
                loggerFactory.getLogger(module.id).debug(`Updating user profile failed: ${err}. User: ${user.uid}.`, { err });

                return callback('Motto Update Fail');
            }

            loggerFactory.getLogger(module.id).info(`Updating user motto successed. User: ${user.uid}.`);
            if (user.pwd == '') {
                return callback('Update success');
            }

            var cmd = 'UPDATE users SET pwd = ? WHERE uid = ?';
            user.pwd = crypto.createHash('sha1').update(user.pwd).digest('hex');
            connection.query(cmd, [user.pwd, user.uid], function(err, result) {
                if (err) {
                    loggerFactory.getLogger(module.id).debug(`Updating user password failed. User: ${user.uid}.`, { err });
                    return callback('Password Change Fail');
                }

                loggerFactory.getLogger(module.id).info(`Updating user password successed. User: ${user.uid}.`);
                return callback('Password has been changed');
            });
        });
    },
    login: function(user, session, callback) { // login verify
        var pwd = crypto.createHash('sha1').update(user.pwd).digest('hex');
        var cmd = 'SELECT uid, class FROM users WHERE lgn = ? AND pwd = ?';
        connection.query(cmd, [user.lgn, pwd], function(err, result) {
            if (err || result.length == 0) {
                const logger = loggerFactory.getLogger(module.id);
                logger.info(`Login: failed, ${user.lgn}.`);
                logger.debug(err);
                return callback(0);
            }

            session.uid = result[0].uid;
            session.lgn = user.lgn;

            loggerFactory.getLogger(module.id).info(`Login: ${session.uid} ${session.lgn}.`);

            session["class"] = result[0]["class"];
            return callback(1);
        });
    },
    verifyPasswordPromise: (user, password) => {
        return new Promise((resolve, reject) => {
            const hash = crypto.createHash('sha1').update(password).digest('hex');
            const cmd = 'SELECT uid, lgn, class FROM users WHERE lgn = ? AND pwd = ?';

            connection.query(cmd, [user, hash], (err, result) => {
                if (err)
                    reject(err);
                else if (result.length == 0)
                    reject("invalid user or password");
                else
                    resolve(result[0]);
            });
        });
    },
    userExistsPromise: (user) => {
        return new Promise((resolve, reject) => {
            const cmd = 'SELECT uid, lgn FROM users WHERE lgn = ?';

            connection.query(cmd, [user], (err, result) => {
                if (err)
                    reject(err);
                else if (result.length == 0)
                    resolve(false);
                else
                    resolve(true);
            })
        });
    },
    getUserByUidPromise: uid => {
        return new Promise((resolve, reject) => {
            const cmd = 'SELECT uid, lgn, class FROM users WHERE uid = ?';

            connection.query(cmd, [uid], (err, result) => {
                if (err)
                    reject(err);
                else
                    resolve(result);
            })
        });
    },
    addUserPromise: user => {
        return new Promise((resolve, reject) => {
            let value = {
                ts1: Date.now(),
                ts2: Date.now(),
                lgn: user.name,
                pwd: crypto.createHash('sha1').update(user.password).digest('hex'),
                motto: escape(''),
                email: user.email,
                nname: user.name,
                ename: '',
                'class': user['class']
            };

            let cmd = 'INSERT INTO users SET ?';
            connection.query(cmd, [value], function(err, result) {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });
    },
    setGid: function(uid, gid) {
        return new Promise((resolve, reject) => {
            let cmd = 'UPDATE users set gid = ? where uid = ?;';
            connection.query(cmd, [gid, uid], function(err, result) {
                if (err) {
                    reject(err);
                    return;
                }

                resolve(result);
            })
        });
    },
    unsetGid: function(uid) {
        return new Promise((resolve, reject) => {
            let cmd = 'UPDATE users set gid = null where uid = ?;';
            connection.query(cmd, [uid], function(err, result) {
                if (err) {
                    reject(err);
                    return;
                }

                resolve(result);
            })
        });
    },
    unsetGidByGid: function(gid) {
        return new Promise((resolve, reject) => {
            let cmd = 'UPDATE users set gid = null where gid = ?;';
            connection.query(cmd, [gid], function(err, result) {
                if (err) {
                    reject(err);
                    return;
                }

                resolve(result);
            })
        });
    },
    promises
};
