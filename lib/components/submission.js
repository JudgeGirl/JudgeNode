var mysql = require('mysql'),
    fs = require('graceful-fs'),
    path = require("path"),
    crypto = require('crypto');
const escape = require('escape-html');
const config = require('../config').config;
var message = require('./message');
var connection = require('../mysql').connection;

const { loggerFactory } = require('lib/components/logger/LoggerFactory');

const promises = {
    getSubmission: sid => {
        return new Promise((resolve, reject) => {
            const cmd = 'SELECT * FROM submissions WHERE sid = ?';

            connection.query(cmd, [sid], (err, result) => {
                if (err)
                    reject(err);
                else
                    resolve(result);
            })
        });
    }
}

function result_json(str) {
    var lines = str.split("\n");
    var ret = {state: 'OTHER'};
    if (lines[0].indexOf("Subtask") < 0) {
        ret['message'] = [str];
        return ret;
    }
    var chunk = 7,
        subtask = [];
    ret['state'] = 'JUDGE';
    for (var i = 0; i < lines.length; i += chunk) {
        var testpt = lines.slice(i, i+chunk);
        if (testpt[0].indexOf("Subtask") == 0 && testpt[3] == 'CE') {
            var logLines = parseInt(testpt[4]);
            var log = lines.slice(i+5, i+5+logLines).join('\n');
            i = i - chunk + 5 + logLines;
            subtask.push({name: testpt[0], input: testpt[2], cpu: 0, mem: 0, status: 'CE', log: log});
        } else if (testpt[0].indexOf("Subtask") == 0 && testpt.length == 7) {
            var cpu = parseInt(testpt[3].split(" ")[1]);
            var mem = parseInt(testpt[4].split(" ")[1]);
            subtask.push({name: testpt[0], input: testpt[2], cpu: cpu, mem: mem, status: testpt[5]});
        } else {
            subtask.push({name: testpt[0], input: testpt[2], cpu: 0, mem: 0, status: 'X'});
        }
    }
    ret['message'] = subtask;
    return ret;
}
module.exports = {
    promises,
    list: function(filter, isAdmin, isStrong, callback) {
        var cond, cmp, offset = 0, count = 25;

        // subLimit is the filter given by url query
        var subLimit = [];
        cmp = 'S.sid DESC';
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
            } else if (key == 'sid') {
                subLimit.push('S.sid = ' + value);
            } else if (key == 'page') {
                offset = (Math.max(value, 1) - 1) * count;
            } else {
                cmp = 'S.scr DESC, S.cpu, S.mem, S.len, S.sid DESC';
            }
        }

        /** Permission
         *  type(submission)   -> (public, admin, strong, other)
         *  permission(admin)  -> (public + admin + strong + other)
         *  permission(strong) -> (public + strong + other)
         *  permission(other)  -> (public + other)
         */
        let info = ['S.uid = U.uid'];
        if (!isAdmin) {
            if (isStrong) {
                info.push('(P.pub = 1 OR U.class IS NOT NULL)');
            } else {
                info.push('(P.pub = 1 OR (U.class IS NOT NULL AND U.class != 5))');
            }
        }

        cond = info.join(' AND ') + ' ORDER BY ' + cmp;
        subLimit = subLimit.length > 0 ? ' WHERE ' + subLimit.join(' AND ') : ''
        var cmd = 'SELECT S.sid, S.ts, S.uid, S.pid, S.cid, S.res, S.scr, S.lng, S.cpu, S.mem, S.len, U.lgn, P.ttl, U.ip, 1 - ISNULL(RP.sid) as hasReport, G.name as guildTitle, G.icon as guildIcon, S.factor as factor FROM ' +
                  '(SELECT S.sid, S.ts, S.uid, S.pid, S.cid, S.res, S.scr, S.lng, S.cpu, S.mem, S.len, S.factor FROM submissions S ' +
                  subLimit  +
                  ' ORDER BY S.sid DESC LIMIT ?, ?) S ' +
                  'LEFT JOIN (SELECT U.uid, U.lgn, U.ip, U.class, U.gid FROM users U) U ON (S.uid = U.uid) ' +
                  'LEFT JOIN problems P on S.pid = P.pid ' +
                  'LEFT JOIN reports RP on RP.sid = S.sid ' +
                  'LEFT JOIN guilds G on U.gid = G.gid ' +
                  ' WHERE ' + cond;

        connection.query(cmd, [offset, count], function(err, result) {
            if (err) {
                console.log(err)
            }
            callback(result);
        });
    },
    listinfo: function(filter, isAdmin, isStrong, callback) {
        // for leaving paganation info in the submission page

        var cond, cmp, info;
        cmp = 'S.sid DESC';
        info = ['S.uid = U.uid', 'S.pid = P.pid'];
        for (var key in filter) {
            var value = parseInt(filter[key]);
            if (key == 'uid') {
                info.push('S.uid = ' + value);
            } else if (key == 'pid') {
                info.push('S.pid = ' + value);
            } else if (key == 'cid') {
                info.push('S.cid = ' + value);
            } else if (key == 'res') {
                info.push('S.res = ' + value);
            } else if (key == 'sid') {
                info.push('S.sid = ' + value);
            } else if (key == 'page') {
                continue;
            } else {
                cmp = 'S.scr DESC, S.cpu, S.mem, S.len, S.sid DESC';
            }
        }

        /** Permission
         *  type(submission)   -> (public, admin, strong, other)
         *  permission(admin)  -> (public + admin + strong + other)
         *  permission(strong) -> (public + strong + other)
         *  permission(other)  -> (public + other)
         */
        if (!isAdmin) {
            if (isStrong) {
                info.push('(P.pub = 1 OR U.class IS NOT NULL)');
            } else {
                info.push('(P.pub = 1 OR (U.class IS NOT NULL AND U.class != 5))');
            }
        }

        cond = info.join(' AND ') + ' ORDER BY ' + cmp;
        var cmd = 'SELECT COUNT(*) AS count FROM submissions S, users U, problems P WHERE ' + cond;
        var ret = {};
        connection.query(cmd, [], function(err, result) {
            if (!err) {
                ret.count = result[0].count;
            }
            callback(ret);
        });
    },
    statistic: function(cid, pid, callback) {
        var cmd = 'SELECT res, COUNT(*) AS count FROM submissions WHERE pid = ? AND cid = ? GROUP BY res';
        var statistic = {};
        connection.query(cmd, [pid, cid], function(err, result) {
            if (err) {
                console.log(err);
            }
            statistic.donut = result;
            callback(statistic);
        });
    },
    source_code: function(sid, uid, type, callback) {
        var err_source = [{title: 'ERROR', code: ''}];
        if (uid == undefined || uid < 0) {
            err_source[0].code = message.source_code;
            return callback(err_source);
        }
        var return_source = function(pid) {
            var problemManager = require('./ProblemManager');
            problemManager.sourceList(pid, function(source_list) {
                if (source_list.length === 0)
                    source_list.push("source");
                var source = [];
                for (var i = 0; i < source_list.length; i++) {
                    var spath = config.JUDGE.path + "submission/" + sid + "-" + i;
                    try {
                        var data = fs.readFileSync(spath, 'utf8');
                        source.push({title: source_list[i], code: data.toString()});
                    } catch (err) {

                    }
                }
                callback(source);
            });
        };
        if (type !== null && config.CONTEST.MODE == true) {
            var cmd = 'SELECT * FROM submissions WHERE sid = ? AND uid = ?';
            connection.query(cmd, [sid, uid], function(err, result) {
                if (err || result.length == 0) {
                    err_source[0].code = 'SUBMISSION NOT FOUND';
                    return callback(err_source);
                }
                var pid = result[0].pid;
                var cmd = 'SELECT * FROM contest_problem NATURAL JOIN contests WHERE contests.ts1 < ? AND contests.ts2 > ? AND pid = ?';
                connection.query(cmd, [new Date().getTime(), new Date().getTime(), pid], function(err, result) {
                    if (err || !result || result.length == 0) {
                        var cmd = 'SELECT * FROM contest_special NATURAL JOIN contests WHERE contests.ts1 < ? AND contests.ts2 > ? AND pid = ?'
                        connection.query(cmd, [new Date().getTime(), new Date().getTime(), pid], function(err, result) {
                            if (err || !result || result.length == 0) {
                                err_source[0].code = message.source_code;
                                return callback(err_source);
                            }
                            return_source(pid);
                        });
                    } else {
                        return_source(pid);
                    }
                });
            });
        } else {
            var cmd = 'SELECT * FROM submissions WHERE sid = ?';
            connection.query(cmd, [sid], function(err, result) {
                if (err || result.length == 0) {
                    err_source[0].code = 'SUBMISSION NOT FOUND';
                    return callback(err_source);
                }
                var pid = result[0].pid;
                var cmd = 'SELECT NULL FROM submissions WHERE sid = ? AND uid = ?';
                connection.query(cmd, [sid, uid], function(err, result) {
                    if (err) {
                        err_source[0].code = 'SUBMISSION NOT FOUND';
                        return callback(err_source);
                    }
                    if (type === null || type == 5 || result.length != 0) {
                        return_source(pid);
                    } else {
                        var cmd = 'SELECT * FROM submissions WHERE sid = ?';
                        connection.query(cmd, [sid], function(err, result) {
                            if (err || result.length == 0) {
                                err_source[0].code = 'SUBMISSION NOT FOUND';
                                return callback(err_source);
                            }
                            var pid = result[0].pid;
                            var cmd = 'SELECT NULL FROM submissions WHERE pid = ? AND uid = ? AND res = 7 GROUP BY pid';
                            connection.query(cmd, [pid, uid], function(err, result) {
                                if (err || result.length == 0) {
                                    err_source[0].code = 'YOU HAVE NOT SOLVED IT';
                                    return callback(err_source);
                                }
                                return_source(pid);
                            });
                        });
                    }
                });
            });
        }
    },
    source_result: function(sid, uid, type, callback) {
        // User must login to view source codes of submission.
        if (uid == undefined || uid < 0)
            return callback(message.source_result);

        var return_result = function(sid) {
            var spath = config.JUDGE.path + "submission/" + sid + "-z";
            fs.readFile(spath, 'utf8', function(readFileErr, buf_data){
                if (readFileErr) {
                    const err = new Error('Source result read file error.');
                    loggerFactory.getLogger(module.id).debug(err, { err: readFileErr });
                    return callback(message.source_result_error);
                }
                return callback(result_json(buf_data.toString()));
            });
        };
        var cmd = 'SELECT * FROM submissions WHERE sid = ?';
        connection.query(cmd, [sid], function(err, result) {
            if (err) {
                loggerFactory.getLogger(module.id).debug(new Error(`Failed to fetch the submission. sid: ${sid}.`), { err });
                return callback(message.source_result);
            }

            if (!result || result.length == 0)
                return callback(message.source_result);

            var pid = result[0].pid, owner_id = result[0].uid;
            if (owner_id == uid || type === null || type == 5)
                return return_result(sid);
            var cmd = 'SELECT NULL FROM submissions WHERE pid = ? AND uid = ? AND res = 7 GROUP BY pid';
            connection.query(cmd, [pid, uid], function(err, result) {
                if (err) {
                    const log = new Error(`Failed to check the permission to see judge highlight. pid: ${pid}. uid: ${uid}.`);
                    loggerFactory.getLogger(module.id).debug(log, { err });
                    return callback(message.source_result);
                }

                if (result.length == 0)
                    return callback(message.source_result);

                return_result(sid);
            });
        });
    },
    submissionExistsPromise: sid => {
        if (!sid)
            return false;

        return new Promise((resolve, reject) => {
            let cmd = "select * from submissions where sid = ?";
            connection.query(cmd, sid, (err, result) => {
                if (err)
                    reject(err);
                else if (result.length == 0)
                    resolve(false);
                else
                    resolve(true);
            });
        });
    },
    setResultPromise: (sid, result) => {
        return new Promise((resolve, reject) => {
            let cmd = "update submissions set res = ? where sid = ?";
            connection.query(cmd, [result, sid], (err, result) => {
                if (err)
                    reject(err);
                else
                    resolve(true);
            });
        });
    },
    setSubmissionPromise: (sid, values) => {
        return new Promise((resolve, reject) => {
            let cmd = "update submissions set ? where sid = ?";
            connection.query(cmd, [values, sid], (err, result) => {
                if (err)
                    reject(err);
                else
                    resolve(true);
            });
        });
    }
};
