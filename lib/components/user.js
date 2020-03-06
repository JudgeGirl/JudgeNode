var mysql = require('mysql'),
    fs = require('graceful-fs'),
    path = require("path"),
    crypto = require('crypto'),
    escape = require('escape-html'),
    config = require('../config').config;

var connection = require('../mysql').connection;

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
                var cmd = 'SELECT S.sid, S.ts, S.uid, S.pid, S.cid, S.res, S.scr, S.lng, S.cpu, S.mem, S.len, U.lgn, P.ttl, U.ip FROM submissions S, users U, problems P WHERE U.uid = ? AND S.uid = U.uid AND S.pid = P.pid';
                if (!isSelf){
                        cmd += ' AND P.pub = 1';
		}
		cmd += ' ORDER BY sid DESC LIMIT 20';
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
            if (err)
                return callback('Motto Update Fail');
            if (user.pwd == '') {
                return callback('Update success');
            }
            var cmd = 'UPDATE users SET pwd = ? WHERE uid = ?';
            user.pwd = crypto.createHash('sha1').update(user.pwd).digest('hex');
            connection.query(cmd, [user.pwd, user.uid], function(err, result) {
                if (err)
                    return callback('Password Change Fail');
                return callback('Password has been changed');
            });
        });
    },
    login: function(user, session, callback) { // login verify
        var pwd = crypto.createHash('sha1').update(user.pwd).digest('hex');
        var cmd = 'SELECT uid, class FROM users WHERE lgn = ? AND pwd = ?';
        connection.query(cmd, [user.lgn, pwd], function(err, result) {
            if (err || result.length == 0) {
                console.log(err);
                return callback(0);
            }
            console.log(result);
            session.uid = result[0].uid;
            session.lgn = user.lgn;
            session["class"] = result[0]["class"];
            return callback(1);
        });
    },
    verifyPassword: (user, password) => {
        return new Promise((resolve, reject) => {
            const hash = crypto.createHash('sha1').update(password).digest('hex');
            const cmd = 'SELECT uid, lgn, class FROM users WHERE lgn = ? AND pwd = ?';

            connection.query(cmd, [user, hash], (err, result) => {
                if (err)
                    reject(err);
                if (result.length == 0)
                    reject("invalid user or password");
                else
                    resolve(result[0]);
            });
        });
    }
};
