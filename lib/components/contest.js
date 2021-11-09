var mysql = require('mysql'),
    fs = require('graceful-fs'),
    path = require("path"),
    crypto = require('crypto');
    escape = require('escape-html'),
    config = require('../config').config;
    message = require('./message');

const { resourceFactory } = require('./resource/ResourceFactory');
const ScoreboardTable = require('./ScoreboardTable');

var connection = require('../mysql').connection;

const enable = function(cid, uid, callback) {
    // permission: viewing a contest

    var cmd = 'SELECT * FROM contests WHERE cid = ?';
    var nowtime = new Date().getTime();
    connection.query(cmd, [cid], function(err, result) {
        if (err || result.length == 0) {
            return callback(0, contest, "You are not allowed to see the contest !");
        }
        var contest = result[0];
        if (nowtime < contest.ts1) {
            return callback(0, contest, "The contest hasn't started yet !");
        }
        var isContestMember = false;
        // isPublicContest = false,
        // isFinished = false;
        if (contest.pub != 0) {
            // isPublicContest = true;
            isContestMember = true;
        }
        var cmd = 'SELECT NULL FROM contest_user WHERE cid = ? AND uid = ?';
        connection.query(cmd, [cid, uid], function(err, result) {
            if (result && result.length != 0)
                isContestMember = true;
            // if (nowtime > contest.ts2)
            //     isFinished = true;
            // else
            //     isFinished = false;
            if (isContestMember == false) {
                return callback(0, contest, "You are not allowed to see the contest !");
            }
            return callback(1, contest, "");
        });
    });
};

const scoreboard = async function(cid, uid, callback) {
    let problems = await promise.scoreboard.getProblem(cid);
    let stats = await promise.scoreboard.getUserScoreFromSubmission(cid);
    let userLookupTable = await promise.scoreboard.getUserInfoTable(cid);
    let rowScore = await promise.scoreboard.getRowScore(cid);
    let grade = await promise.scoreboard.getUserScore(cid);

    let scoreboardTable = new ScoreboardTable(problems, grade, rowScore);

    let table_config = {
        cid: cid,
        header: problems,
        stats: stats || [],
        user: userLookupTable || [],
        scorekind: rowScore,
        grade: grade || [],
        summaryChartData: scoreboardTable.getSummaryChartData(),
        problemScoreDistribution: scoreboardTable.getProblemScoreDistribution(),
        scoreTable: scoreboardTable.getScoreTable()
    };

    let earliestACSubmission = await promise.scoreboard.getEarliestACSubmission(cid);
    let earliestNonACSubmission = await promise.scoreboard.getEarliestNonACSubmission(cid);
    let contest = await promise.getContest(cid)
    if (contest.length != 1) throw Error(`invalid cid ${cid}`);
    contest = contest[0];

    table_config.icpc = {
        ac: earliestACSubmission,
        wa: earliestNonACSubmission,
        contest: contest
    };

    return callback(table_config);
};

const promise = {
    getContest: cid => {
        return new Promise((resolve, reject) => {
            let cmd = 'SELECT * FROM contests WHERE cid = ?;';
            connection.query(cmd, [cid], function(err, result) {
                if (err) return reject(err);

                resolve(result);
            });
        });
    },
    getScoreboard: (cid, uid) => {
        return new Promise(resolve => {
            scoreboard(cid, uid, resolve);
        });
    },
    scoreboard: {
        getProblem: cid => {
            return new Promise((resolve, reject) => {
                let cmd = 'SELECT pid, ttl FROM problems NATURAL JOIN contest_problem WHERE cid = ? ORDER BY pid'.trim();
                connection.query(cmd, [cid], function(err, result) {
                    if (err) return reject(err);

                    resolve(result);
                });
            });
        },
        getEarliestACSubmission: cid => {
            // earliest AC time for each student and for each problem in the contest
            return new Promise((resolve, reject) => {
                let cmd = `
                    SELECT uid, pid, ts, min(sid)
                    FROM submissions
                    WHERE cid = ? AND res = 7
                    GROUP BY uid, pid
                `.trim();
                connection.query(cmd, [cid], function(err, result) {
                    if (err) return reject(err);

                    resolve(result);
                });
            });
        },
        getEarliestNonACSubmission: cid => {
            // failed to AC count for each student and for each problem in the contest
            return new Promise((resolve, reject) => {
                let cmd = `
                    SELECT COUNT(*) as wa, uid, Subs.pid
                    FROM (
                        SELECT min(sid) AS mn_sid, pid AS mn_pid, uid AS mn_uid
                        FROM submissions
                        WHERE cid = ? AND res = 7
                        GROUP BY uid, pid
                    ) AC
                    JOIN (
                        SELECT *
                        FROM submissions
                        WHERE cid = ? AND res != 7
                    ) Subs
                    ON AC.mn_pid = Subs.pid AND AC.mn_uid = Subs.uid AND Subs.sid < AC.mn_sid
                    GROUP BY uid, pid;
                `.trim();
                connection.query(cmd, [cid, cid], function(err, result) {
                    if (err) return reject(err);

                    resolve(result);
                });
            });
        },
        getUserScore: cid => {
            // submit count, max score for each problem in the contest and for each student
            // only for users in contest_user
            return new Promise((resolve, reject) => {
                let cmd = `
                    SELECT uid, lgn, pid, COUNT(*), MAX(scr)
                    FROM submissions S
                    NATURAL JOIN (
                        SELECT uid, lgn
                        FROM contest_user
                        NATURAL JOIN users
                        WHERE cid = ? AND (class IS NOT NULL)
                    ) Z
                    WHERE S.cid = ?
                    GROUP BY pid, uid
                    ORDER BY uid, pid;
                `.trim();
                connection.query(cmd, [cid, cid], function(err, result) {
                    if (err) return reject(err);

                    resolve(result);
                });
            });
        },
        getUserScoreFromSubmission: cid => {
            // max scores of submissions in the contest for each problem and for each student
            // including all submissions with target cid
            return new Promise((resolve, reject) => {
                let cmd = `
                    SELECT uid, pid, MAX(scr)
                    FROM submissions
                    NATURAL JOIN users
                    WHERE cid = ? AND (class IS NOT NULL)
                    GROUP BY uid, pid;
                `.trim();
                connection.query(cmd, [cid], function(err, result) {
                    if (err) return reject(err);

                    resolve(result);
                });
            });
        },
        getUserInfoTable: cid => {
            // user, login name lookup table
            return new Promise((resolve, reject) => {
                let cmd = 'SELECT uid, lgn FROM contest_user NATURAL JOIN users WHERE cid = ? AND (class IS NOT NULL)';
                connection.query(cmd, [cid], function(err, result) {
                    if (err) return reject(err);

                    resolve(result);
                });
            });
        },
        getRowScore: cid => {
            // rows of table of score distribution
            return new Promise((resolve, reject) => {
                let cmd = `
                    SELECT DISTINCT MAX(S.scr) AS max_res
                    FROM submissions S
                    JOIN contest_user CU
                        ON CU.cid = S.cid AND CU.uid = S.uid
                    WHERE S.cid = ?
                    GROUP BY S.uid, S.pid
                    ORDER BY max_res DESC;`
                connection.query(cmd, [cid], function(err, result) {
                    if (err) return reject(err);

                    resolve(result);
                });
            });
        }
    },
    canViewContest: (cid, uid) => {
        return new Promise((resolve, reject) => {
            enable(cid, uid, function(statusCode, contest, message) {
                resolve({ statusCode, contest, message });
            })
        });
    }
}

module.exports = {
    list: function(filter, uid, callback) {
        var offset = 0, count = 25;
        for (var key in filter) {
            var value = parseInt(filter[key]);
            if (key == 'page') {
                offset = (Math.max(value, 1) - 1) * count;
            }
        }
        var cmd = 'SELECT cid, pub, ts1, ts2, ttl FROM contests WHERE pub != 0 AND deleted = 0 UNION SELECT cid, pub, ts1, ts2, ttl FROM contests NATURAL JOIN contest_user WHERE uid = ' + uid + ' AND deleted = 0 ORDER BY ts2 DESC';
        if (uid == undefined || uid == -1)
            cmd = 'SELECT cid, pub, ts1, ts2, ttl FROM contests WHERE pub != 0 AND deleted = 0 ORDER BY ts2 DESC';
        cmd += ' LIMIT ?, ?'; connection.query(cmd, [offset, count], function(err, result) {
            if (err) {
                callback(null);
                return 0;
            }
            callback(result);
        });
    },
    listsize: function(filter, uid, callback) {
        var cmd = 'SELECT cid, pub, ts1, ts2, ttl FROM contests WHERE pub != 0 UNION SELECT cid, pub, ts1, ts2, ttl FROM contests NATURAL JOIN contest_user WHERE uid = ' + uid;
        if (uid == undefined || uid == -1)
            cmd = 'SELECT cid, pub, ts1, ts2, ttl FROM contests WHERE pub != 0';
        cmd = 'SELECT COUNT(*) AS count FROM ( ' + cmd + ') AS Z';
        connection.query(cmd, [], function(err, result) {
            if (err) {
                console.log(err);
                callback(0);
                return 0;
            }
            callback(result[0].count);
        });
    },
    problemlist: function(cid, uid, callback) {
        var cmd = 'SELECT pid, MAX(scr) as score, COUNT(*) as submits FROM submissions WHERE cid = ? and uid = ? GROUP BY uid, pid ORDER BY pid';
        var problem_config = {};
        connection.query(cmd, [cid, uid], function(err, result) {
            if (err) {
                callback(0, problem_config);
                return 0;
            }
            problem_config.score = result;

            // get whether the contest uses style check factor
            let cmd = 'SELECT sfrid FROM contests where cid = ?;';
            connection.query(cmd, [cid], function(err, result) {
                if (err) {
                    callback(0, problem_config);
                    return 0;
                }

                if (result.length == 0) {
                    callback(0, problem_config);
                    return 0;
                }

                problem_config.enableStyleFactor = !(result[0].sfrid === null);

                // get problem list
                let cmd = `
                    SELECT pid, ttl, standard_cyclomatic_complexity
                    FROM problems
                    NATURAL JOIN contest_problem
                    WHERE cid = ?
                `.trim();
                connection.query(cmd, [cid], function(err, result) {
                    if (err) {
                        callback(0, problem_config);
                        return 0;
                    }
                    problem_config.list = result;
                    callback(1, problem_config);
                });
            });
        });
    },
    rule: async function(cid, callback) {
        let data;
        try {
            let contestResource = resourceFactory.createContestResource();
            data = await contestResource.getHTML(cid);
            data = data.toString();
        } catch (err) {
            data = null;
        }

        if (data !== null) {
            callback(data);
            return;
        }

        // Failover to the default rule.
        try {
            let contestResource = resourceFactory.createContestResource();
            data = await contestResource.getHTML('default');
            data = data.toString();
        } catch (err) {
            data = null;
        }

        if (data !== null) {
            callback(data);
            return;
        }


        callback('RULE NOT FOUND');
    },
    scoreboard: scoreboard,
    enable: enable,
    promise
};
