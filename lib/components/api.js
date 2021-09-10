var mysql = require('mysql'),
    fs = require('graceful-fs'),
    path = require("path"),
    crypto = require('crypto'),
    escape = require('escape-html'),
    config = require('../config').config;

var connection = require('../mysql').connection;

const { loggerFactory } = require('lib/components/logger/LoggerFactory');

const dbQuery = cmd => {
    return new Promise((resolve, reject) => {
        connection.query(cmd, [], (err, result) => {
            if (err)
                reject(err);
            else
                resolve(result);
        });
    });
};

module.exports = {
    list: function(filter, isAdmin, callback) {

        loggerFactory.getLogger(module.id).silly('List submission.', { filter, isAdmin });

        var cond, cmp, info, offset = 0,
            count = 20;
        var subLimit = [];
        cmp = 'S.sid DESC';
        info = ['S.uid = U.uid'];
        for (var key in filter) {
            var value = parseInt(filter[key]);
            if (key == 'uid') {
                subLimit.push('S.uid = ' + value);
            } else if (key == 'pid') {
                subLimit.push('S.pid = ' + value);
            } else if (key == 'cid') {
                subLimit.push('S.cid = ' + value);
            } else if (key == 'res') {
                subLimit.push('S.res = ' + value);
            } else if (key == 'page') {
                offset = (Math.max(value, 1) - 1) * count;
            } else if (key == 'limit') {
                count = Math.min(count, value);
            } else {
                cmp = 'S.scr DESC, S.cpu, S.mem, S.len, S.sid DESC';
            }
        }
        if (!isAdmin)
            info.push('(P.pub = 1 OR (U.class IS NOT NULL AND U.class != 5))');
        cond = info.join(' AND ') + ' ORDER BY ' + cmp;
        subLimit = subLimit.length > 0 ? ' WHERE ' + subLimit.join(' AND ') : '';
        var cmd = 'SELECT S.sid, S.ts, S.uid, S.pid, S.cid, S.res, S.scr, S.lng, S.cpu, S.mem, S.len, U.lgn, P.ttl, U.ip, 1 - ISNULL(RP.sid) as hasReport, G.name as guildTitle, G.icon as guildIcon FROM ' +
            '(SELECT S.sid, S.ts, S.uid, S.pid, S.cid, S.res, S.scr, S.lng, S.cpu, S.mem, S.len FROM submissions S ' +
            subLimit + ' ORDER BY S.sid DESC LIMIT ?, ?) S ' +
            'LEFT JOIN (SELECT U.uid, U.lgn, U.ip, U.class, U.gid FROM users U) U ON (S.uid = U.uid) ' +
            'LEFT JOIN problems P on S.pid = P.pid ' +
            'LEFT JOIN reports RP on RP.sid = S.sid ' +
            'LEFT JOIN guilds G on U.gid = G.gid ' +
            'WHERE ' + cond;
        // var cmd = 'SELECT S.sid, S.ts, S.uid, S.pid, S.cid, S.res, S.scr, S.lng, S.cpu, S.mem, S.len, U.lgn, P.ttl, U.ip FROM submissions S, users U, problems P WHERE ' + cond + ' LIMIT ?, ?';
        connection.query(cmd, [offset, count], function(err, result) {
            if (err)
                console.log(`Failed to list submissions: ${err}.`);

            callback(result);
        });
    },
    problems: function(did, lid, uid, callback) {
        var sql_depend = function(ret, did, lid, uid, callback) {
            var cmd = 'SELECT LPD.pid AS pid, COUNT(*) AS depend_count FROM (SELECT LP.pid, PD.depend_pid FROM (SELECT pid FROM problems AS P JOIN level_domain AS L ON P.level = L.level AND L.did = ? AND P.pub != 0 AND L.level = ?) AS LP JOIN problem_dependency AS PD ON LP.pid = PD.pid) AS LPD JOIN (SELECT pid FROM users NATURAL JOIN submissions WHERE uid = ? AND res = 7 GROUP BY uid, pid ORDER BY pid) AS AC ON LPD.depend_pid = AC.pid GROUP BY pid';
            connection.query(cmd, [did, lid, uid], function(err, result) {
                ret.solve_dep = result;
                var cmd = 'SELECT LP.pid AS pid, COUNT(*) AS depend_count FROM (SELECT pid FROM problems AS P JOIN level_domain AS L ON P.level = L.level AND L.did = ? AND P.pub != 0 AND L.level = ?) AS LP JOIN problem_dependency AS PD ON LP.pid = PD.pid GROUP BY pid';
                connection.query(cmd, [did, lid], function(err, result) {
                    ret.prob_dep = result;
                    callback(ret);
                });
            });
        };
        var cmd = 'SELECT pid, ttl, ts FROM problems AS P JOIN level_domain AS L ON P.level = L.level AND L.did = ? AND P.level = ? WHERE pub != 0 ORDER BY P.level ASC, porder ASC';
        var ret = {};
        connection.query(cmd, [did, lid], function(err, result) {
            ret.plist = result;
            var cmd = 'SELECT S.pid, MAX(S.res) as res FROM submissions AS S JOIN (SELECT pid FROM problems AS P JOIN level_domain AS L ON P.level = L.level AND L.did = ? AND P.level = ? WHERE pub != 0 ORDER BY P.level ASC, porder ASC) AS D ON D.pid = S.pid WHERE S.uid = ? GROUP BY uid, pid ORDER BY pid';
            connection.query(cmd, [did, lid, uid], function(err, result) {
                ret.score = result;
                var cmd = 'SELECT SUBS_ALL.pid AS pid, SUBS_ALL.count AS total, SUBS_AC.count AS ac FROM (SELECT S.pid, COUNT(*) as count FROM submissions AS S JOIN (SELECT pid FROM problems AS P JOIN level_domain AS L ON P.level = L.level AND L.did = ? AND P.level = ? WHERE pub != 0 ORDER BY P.level ASC, porder ASC) AS D ON D.pid = S.pid GROUP BY pid ORDER BY pid) AS SUBS_ALL JOIN (SELECT S.pid, COUNT(*) as count FROM submissions AS S JOIN (SELECT pid FROM problems AS P JOIN level_domain AS L ON P.level = L.level AND L.did = ? AND P.level = ? WHERE pub != 0 ORDER BY P.level ASC, porder ASC) AS D ON D.pid = S.pid WHERE S.res = 7 GROUP BY pid ORDER BY pid) AS SUBS_AC ON SUBS_ALL.pid = SUBS_AC.pid';
                connection.query(cmd, [did, lid, did, lid], function(err, result) {
                    ret.subs = result;
                    sql_depend(ret, did, lid, uid, callback);
                });
            });
        });
    },
    result: function(sid, isAdmin, callback) {
        loggerFactory.getLogger(module.id).silly('Get result.', { sid, isAdmin });

        var cond = '';
        if (!isAdmin)
            // If a submission is from admin and the problem for it is private, we do not provide the information of this submission.
            cond = 'S.uid = U.uid AND (P.pub = 1 OR U.class IS NOT NULL) AND S.sid = ? ORDER BY S.sid DESC'
        else
            cond = 'S.uid = U.uid AND S.sid = ? ORDER BY S.sid DESC'

        const windowSize = 20; // This is the window in which the we search for the submission.
        var cmd = 'SELECT S.sid, S.ts, S.uid, S.pid, S.cid, S.res, S.scr, S.lng, S.cpu, S.mem, S.len, U.lgn, P.ttl, U.ip, 1 - ISNULL(RP.sid) as hasReport FROM ' +
            '(SELECT S.sid, S.ts, S.uid, S.pid, S.cid, S.res, S.scr, S.lng, S.cpu, S.mem, S.len FROM submissions S ORDER BY S.sid DESC LIMIT ?) S ' +
            'LEFT JOIN (SELECT U.uid, U.lgn, U.ip, U.class FROM users U) U ON (S.uid = U.uid) ' +
            'LEFT JOIN problems P ON P.pid = S.pid ' +
            'LEFT JOIN reports RP ON RP.sid = S.sid' +
            ' WHERE ' + cond;

        connection.query(cmd, [windowSize, sid], function(err, result) {
            if (err) {
                loggerFactory.getLogger(module.id).debug('DB error.', { err });
                return callback([]);
            }

            if (result.length !== 1) {
                loggerFactory.getLogger(module.id).debug('Entity error.', { result });
                return callback([]);
            }

            callback(result);
        });
    },
    rejudge: function(filter, callback) {
        var info, cond, hasPid = false;
        info = [];
        for (var key in filter) {
            var value = parseInt(filter[key]);
            if (key == 'uid') {
                info.push('uid = ' + value);
            } else if (key == 'pid') {
                info.push('pid = ' + value);
                hasPid = true;
            } else if (key == 'cid') {
                info.push('cid = ' + value);
            } else if (key == 'sid') {
                info.push('sid = ' + value);
            }
        }
        if (info.length > 0 && hasPid == true) {
            cond = info.join(' AND ');
            var cmd = 'UPDATE submissions SET res = 0 WHERE ' + cond;
            connection.query(cmd, [], function(err, result) {
                if (err) console.log(err);
                return callback();
            });
        } else {
            return callback();
        }
    },
    waitingNumber: () => {
        return new Promise((resolve, reject) => {
            let cmd = "select count(*) as count from submissions where res = 0";

            connection.query(cmd, [], (err, result) => {
                if (err)
                    reject(err);
                else
                    resolve(result[0]["count"]);
            });
        });
    },
    submissionWaitSecs: () => {
        let cmd = "select * from submissions where res = 0 order by sid desc limit 1";
        return dbQuery(cmd).then(result => {
            if (result.length == 0) return 0;

            let submissionTimeStamp = result[0].ts;
            let currentMilliSecond = Date.now();

            let secs = (currentMilliSecond - submissionTimeStamp) / 1000;

            return Math.ceil(secs);
        });
    }
};
