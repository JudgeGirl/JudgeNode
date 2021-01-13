let fs = require('graceful-fs');
let crypto = require('crypto');
let escape = require('escape-html');
let config = require('../config').config;
let message = require('./message');
var markdown = require('./plugin/markdown');
const { resourceFactory } = require('./resource/ResourceFactory');

var connection = require('../mysql').connection;

module.exports = {
    load_dashboard: function(callback) {
        var practice_problem = function(ret, callback) {
            var cmd = 'SELECT max(pid) AS pid FROM problems WHERE pid < 10000';
            connection.query(cmd, [], function(err, result) {
                if (result && result.length > 0)
                    ret.practice = result[0].pid;
                callback(ret);
            });
        };
        var contest_problem = function(ret, callback) {
            var cmd = 'SELECT max(pid) AS pid FROM problems WHERE pid >= 10000 AND pid < 20000';
            connection.query(cmd, [], function(err, result) {
                if (result && result.length > 0)
                    ret.contest = result[0].pid;
                callback(ret);
            });
        };
        var release_contest_problem = function(ret, callback) {
            var cmd = 'SELECT max(pid) AS pid FROM problems WHERE pid >= 50000';
            connection.query(cmd, [], function(err, result) {
                if (result && result.length > 0)
                    ret.release = result[0].pid;
                callback(ret);
            });
        };
        var exams = function(ret, callback) {
            var cmd = 'SELECT `AUTO_INCREMENT` AS eid FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME="exams"';
            connection.query(cmd, [], function(err, result) {
                if (result && result.length == 1)
                    ret.examid = result[0].eid;
                callback(ret);
            });
        };
        var account = function(ret, callback) {
            ret.account = {}
            var cmd = 'SELECT count(*) AS count FROM users WHERE class is NULL';
            connection.query(cmd, [], function(err, result) {
                if (result && result.length == 1)
                    ret.account.admin = result[0].count;
                var cmd = 'SELECT count(*) AS count FROM users WHERE class = 1 OR class =  2';
                connection.query(cmd, [], function(err, result) {
                    if (result && result.length == 1)
                        ret.account.student = result[0].count;
                    var cmd = 'SELECT count(*) AS count FROM users';
                    connection.query(cmd, [], function(err, result) {
                        if (result && result.length == 1)
                            ret.account.total = result[0].count;
                        callback(ret);
                    });
                });
            });
        };
        var ret = {};
        practice_problem(ret, function(r1) {
            contest_problem(r1, function(r2) {
                release_contest_problem(r2, function(r3) {
                    exams(r3, function(r4) {
                        account(r4, function(r5) {
                            callback(r5);
                        });
                    });
                });
            })
        });
    },
    load_announcement: async function(callback) {
        try {
            let announcementResource = resourceFactory.createAnnouncementResource();
            let announcement = await announcementResource.getMD();
            callback(announcement.toString());
        } catch (err) {
            console.log(err);
            callback('');
        }
    },
    update_announcement: async function(md_text, callback) {
        let html = markdown.post_marked(md_text);

        let announcementResource = resourceFactory.createAnnouncementResource();
        await announcementResource.setMD(null, md_text);
        await announcementResource.setHTML(null, html);

        callback();
    },
    load_problemlist: function(callback) {
        var cmd = 'SELECT * FROM problems ORDER BY ts DESC, pid';
        connection.query(cmd, [], function(err, result) {
            callback(result);
        });
    },
    load_problem_content: function(pid, callback) {
        var cmd = 'SELECT * FROM problems WHERE pid = ?';
        var pconfig = {};
        connection.query(cmd, [pid], function(err, result) {
            pconfig.config = result[0];
            var cmd = 'SELECT * FROM problem_dependency WHERE pid = ?';
            connection.query(cmd, [pid], async function(err, result) {
                pconfig.dependency = result;

                try {
                    let problemResource = resourceFactory.createProblemResource();
                    let mdContent = await problemResource.getMD(pid);

                    pconfig.md = mdContent.toString();
                } catch (err) {
                    pconfig.md = '';
                }

                callback(pconfig);
            });
        });
    },
    load_problem_solution: async function(pid, callback) {
        let content;

        try {
            let solutionResource = resourceFactory.createSolutionResource();
            content = await solutionResource.getMD(pid);
            content = content.toString();
        } catch (err) {
            content = '';
        }

        callback(content);
    },
    update_problem_content: async function(pconfig, callback) {
        let pid = pconfig.pid;
        let mdContent = pconfig.md;
        let htmlContent = markdown.post_marked(mdContent);

        // write parallelly
        let problemResource = resourceFactory.createProblemResource();
        await Promise.all([
            problemResource.setMD(pid, mdContent),
            problemResource.setHTML(pid, htmlContent)
        ]);

        var cmd = 'UPDATE problems SET pub = ?, ttl = ?, level = ?, porder = ?, ts = ? WHERE pid = ?';
        connection.query(cmd, [pconfig.pub, pconfig.ttl, pconfig.level, pconfig.porder, new Date().getTime(), pid], function(err, result) {
            var cmd = 'DELETE FROM problem_dependency WHERE pid = ?';
            connection.query(cmd, [pid], function(err, result) {
                var cmd = 'INSERT INTO problem_dependency SET pid = ?, depend_pid = ?';
                for (var i in pconfig.dependency) {
                    connection.query(cmd, [pid, pconfig.dependency[i]], function(err, result) {

                    });
                }
            });
        });
        callback();
    },
    update_problem_solution: async function(pconfig, callback) {
        let pid = pconfig.pid;
        let mdContent = pconfig.solution_md;
        let htmlContent = markdown.post_marked(mdContent);

        let solutionResource = resourceFactory.createSolutionResource();
        await Promise.all([
            solutionResource.setMD(pid, mdContent),
            solutionResource.setHTML(pid, htmlContent)
        ]);
    },
    load_contestlist: function(callback) {
        var cmd = 'SELECT cid, pub, ts1, ts2, ttl FROM contests ORDER BY cid DESC';
        connection.query(cmd, [], function(err, result) {
            callback(result);
        });
    },
    load_contest_config: function(cid, callback) {
        var cmd = 'SELECT pid, ttl FROM problems NATURAL JOIN contest_problem WHERE cid = ?';
        var c_config = {};
        connection.query(cmd, [cid], function(err, result) {
            c_config.problem = result;
            var cmd = 'SELECT uid, lgn, class FROM contest_user NATURAL JOIN users WHERE cid = ?';
            connection.query(cmd, [cid], function(err, result) {
                c_config.user = result;
                var cmd = 'SELECT * FROM contests WHERE cid = ?';
                connection.query(cmd, [cid], function(err, result) {
                    c_config.config = result[0];
                    var cmd = 'SELECT pid FROM contest_special WHERE cid = ?';
                    connection.query(cmd, [cid], async function(err, result) {
                        c_config.refproblem = result;

                        try {
                            let contestResource = resourceFactory.createContestResource();
                            let mdContent = await contestResource.getMD(cid);
                            c_config.rule = mdContent.toString();
                        } catch (err) {
                            c_config.rule = message.contest_rule_default;
                        }

                        callback(c_config);
                    });
                });
            });
        });
    },
    update_contest_config: async function(c_config, callback) {
        var cmd = 'UPDATE contests SET pub = ?, ttl = ?, ts1 = ?, ts2 = ? WHERE cid = ?';
        connection.query(cmd, [c_config.pub, c_config.ttl, c_config.ts1, c_config.ts2, c_config.cid], function(err, result) {
            var cmd = 'DELETE FROM contest_problem WHERE cid = ?';
            connection.query(cmd, [c_config.cid], function(err, result) {
                var cmd = 'INSERT INTO contest_problem SET cid = ?, pid = ?';
                for (var i in c_config.pid) {
                    connection.query(cmd, [c_config.cid, c_config.pid[i]], function(err, result) {

                    });
                }
            });
        });
        cmd = 'DELETE FROM contest_special WHERE cid = ?';
        connection.query(cmd, [c_config.cid], function(err, result) {
            var cmd = 'INSERT INTO contest_special SET cid = ?, pid = ?';
            for (var i in c_config.refpid) {
                connection.query(cmd, [c_config.cid, c_config.refpid[i]], function(err, result) {

                });
            }
        });
        cmd = 'DELETE FROM contest_user WHERE cid = ?';
        connection.query(cmd, [c_config.cid], function(err, result) {
            for (var i in c_config.participants) {
                var value = parseInt(c_config.participants[i]);
                if (value == 0) {
                    var cmd = 'SELECT uid FROM users WHERE class IS NULL';
                    connection.query(cmd, [], function(err, result) {
                        var cmd = 'INSERT INTO contest_user SET cid = ?, uid = ?';
                        for (var i = 0; i < result.length; i++) {
                            connection.query(cmd, [c_config.cid, result[i].uid], function(err, result) {
                            });
                        }
                    });
                } else {
                    var cmd = 'SELECT uid FROM users WHERE class = ?';
                    connection.query(cmd, [value], function(err, result) {
                        var cmd = 'INSERT INTO contest_user SET cid = ?, uid = ?';
                        for (var i = 0; i < result.length; i++) {
                            connection.query(cmd, [c_config.cid, result[i].uid], function(err, result) {
                            });
                        }
                    });
                }
            }
        });

        let cid = c_config.cid;
        let mdContent = c_config.rule;
        let htmlContent = markdown.post_marked(mdContent);

        let contestResource = resourceFactory.createContestResource();
        await Promise.all([
            contestResource.setMD(cid, mdContent),
            contestResource.setHTML(cid, htmlContent)
        ])

        callback();
    },
    load_accountlist: function(callback) {
        var cmd = 'SELECT * FROM users WHERE class IS NOT NULL ORDER BY uid';
        connection.query(cmd, [], function(err, result) {
            callback(result);
        });
    },
    update_account: function(config, callback) {
        /*
        var config = {
            uid : req.params.uid,
            pwd : req.body.pwd,
            class: req.body.class,
            email: req.body.email
        };
        */
        if (!config.uid) {
            callback();
            return;
        }

        if (!config.pwd && !config.class && !config.email) {
            callback();
            return;
        }

        let cmd = "UPDATE users SET ";
        let update = [];
        let argv = [];

        if (config.pwd) {
            update.push("pwd = ?");
            argv.push(crypto.createHash('sha1').update(config.pwd).digest('hex'));
        }

        if (config.class) {
            update.push("class = ?");
            argv.push(config.class);
        }

        if (config.email) {
            update.push("email = ?");
            argv.push(config.email);
        }

        cmd += update.join(', ') + " WHERE uid = ?";
        argv.push(config.uid);


        connection.query(cmd, argv, function(err, result) {
            callback();
        });
    },
    create_problem_content: function(pconfig, callback) {
        let pid = parseInt(pconfig.pid);
        let mdContent = pconfig.md;
        let htmlContent = markdown.post_marked(mdContent);

        var cmd = 'INSERT INTO problems SET pub = ?, ttl = ?, level = ?, porder = ?, pid = ?, ts = ?';
        connection.query(cmd, [pconfig.pub, pconfig.ttl, pconfig.level, pconfig.porder, pid, new Date().getTime()], async function(err, result) {
            console.log(err);
            if (err)
                return callback();

            let problemResource = resourceFactory.createProblemResource();
            await Promise.all([
                problemResource.setHTML(pid, htmlContent),
                problemResource.setMD(pid, mdContent)
            ]);

            var cmd = 'INSERT INTO problem_dependency SET pid = ?, depend_pid = ?';
            for (var i in pconfig.dependency) {
                connection.query(cmd, [pid, pconfig.dependency[i]], function(err, result) {

                });
            }
            callback();
        });
    },
    create_contest_config: function(config, callback) {
        var cmd = 'INSERT INTO contests SET pub = ?, ttl = ?, ts1 = ?, ts2 = ?';
        connection.query(cmd, [config.pub, config.ttl, config.ts1, config.ts2], function(err, result) {
            if (err)
                return callback();
            var cid = result.insertId;
            config.cid = cid;
            connection.query(cmd, [config.cid], function(err, result) {
                var cmd = 'INSERT INTO contest_problem SET cid = ?, pid = ?';
                for (var i in config.pid) {
                    connection.query(cmd, [config.cid, config.pid[i]], function(err, result) {

                    });
                }
            });
            for (var i in config.participants) {
                var value = parseInt(config.participants[i]);
                if (value == 0) {
                    var cmd = 'SELECT uid FROM users WHERE class IS NULL';
                    connection.query(cmd, [], function(err, result) {
                        var cmd = 'INSERT INTO contest_user SET cid = ?, uid = ?';
                        for (var i = 0; i < result.length; i++) {
                            connection.query(cmd, [config.cid, result[i].uid], function(err, result) {
                            });
                        }
                    });
                } else {
                    var cmd = 'SELECT uid FROM users WHERE class = ?';
                    connection.query(cmd, [value], function(err, result) {
                        var cmd = 'INSERT INTO contest_user SET cid = ?, uid = ?';
                        for (var i = 0; i < result.length; i++) {
                            connection.query(cmd, [config.cid, result[i].uid], function(err, result) {
                            });
                        }
                    });
                }
            }
            callback();
        });
    },
    create_account: function(config, callback) {
        var cmd = 'SELECT uid FROM users WHERE lgn = ?';
        connection.query(cmd, [config.lgn], function(err, result) {
            if (err || result.length > 0) {
                return callback(0);
            }
            var val = {
                ts1 : Date.now(),
                ts2 : Date.now(),
                lgn : config.lgn,
                pwd : crypto.createHash('sha1').update(config.pwd).digest('hex'),
                motto : escape(''),
                email : config.email,
                nname : '',
                ename : '',
                class : parseInt(config.class)
            };
            var cmd = 'INSERT INTO users SET ?';
            connection.query(cmd, [val], function(err, result) {
                if (err) {
                    console.log(err);
                    return callback(0);
                }
                callback(1);
            });
        });
    },
    load_scores: function(callback) {
        var cmd = 'SELECT * FROM exam_scores NATURAL JOIN users NATURAL JOIN exams ORDER BY lgn, eid';
        var res = {};
        connection.query(cmd, [], function(err, result) {
            if (err)    return callback(res);
            res.tbody = result;
            var cmd = 'SELECT * FROM exams ORDER BY eid';
            connection.query(cmd, [], function(err, result) {
                res.thead = result;
                var cmd = 'SELECT uid, lgn FROM users WHERE class = 1 OR class = 2';
                connection.query(cmd, [], function(err, result) {
                    res.user = result;
                    callback(res);
                });
            });
        });
    },
    update_scores: function(uid, exam, callback) {
        uid = parseInt(uid);
        for (var i in exam) {
            var updatesingle = function(uid, eid, s) {
                var cmd = 'DELETE FROM exam_scores WHERE eid = ? AND uid = ?';
                connection.query(cmd, [eid, uid], function(err, result) {
                    if (s != -1) {
                        var cmd = 'INSERT INTO exam_scores (uid, eid, score) VALUES (?, ?, ?)';
                        connection.query(cmd, [uid, eid, s], function(err, result) {
                            if (err)
                                console.log(err);
                        });
                    }
                });
            };
            var eid = parseInt(i), s = parseInt(exam[i]);
            updatesingle(uid, eid, s);
        }
        callback();
    },
    create_exam_scores: function(ttl, callback) {
        var cmd = 'INSERT INTO exams (ttl) VALUES (?)';
        connection.query(cmd, [ttl], function(err, result) {
            if (err) {
                console.log(err);
            }
            callback();
        });
    },
    load_gradettl: function(eid, callback) {
        eid = parseInt(eid);
        var cmd = 'SELECT * FROM exams WHERE eid = ?';
        connection.query(cmd, [eid], function(err, result) {
            if (result && result.length > 0)
                callback(result[0]);
            else
                callback(null);
        });
    },
    update_gradettl: function(eid, ttl, callback) {
        eid = parseInt(eid);
        var cmd = 'UPDATE exams SET ttl = ? WHERE eid = ?';
        connection.query(cmd, [ttl, eid], function(err, result) {
            console.log(err);
            callback();
        });
    }
};
