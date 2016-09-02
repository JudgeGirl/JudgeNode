var express = require('express');
var router = express.Router();
var dblink = require('../lib/components/dblink');
var multer = require('multer');
var _config = require('../lib/config').config;
var markdown = require('../lib/components/plugin/markdown');
var utils = require('../lib/components/utils');
var fs = require('fs');

/* limit upload file size = 64 KB */
var upload = multer({
    dest: 'files/',
    onFileUploadStart: function(file, req, res) {
        if (req.files.file.length > 64 * 1024)
            return false;
        return true;
    },
    limits: {
        fileSize: 64 * 1024
    }
});

/* GET home page, default /archive */
router.get('/', function(req, res, next) {
    dblink.archive.list(function(content) {
        dblink.problemManager.recentUpdate(function(list) {
            res.render('layout', {
                layout: 'archive',
                archive_content: content,
                recent_problems: list
            });
        });
    });
});

/* admin restart web server */
router.get('/restart', function(req, res, next) {
    var uid = req.session.uid;
    dblink.helper.isAdmin(uid, function(isAdmin) {
        if (isAdmin) {
            throw new Exception();
        } else {
            res.redirect(utils.url_for('/'));
        }
    });
});

/* User Information control */
router.get('/login', function(req, res, next) {
    /* record where user comes from */
    req.session.redirect_to = req.header('Referer') || utils.url_for('/');
    res.render('layout', {
        layout: 'login',
        subtitle: 'Login',
        sysmsg: ''
    });
});
/* User Login Submit */
router.post('/login', function(req, res, next) {
    var user = {
        lgn: req.body.lgn,
        pwd: req.body.pwd
    };
    var iplist = _config.CONTEST.VALID_IP;
    var ip = req.ip;
    var backURL = req.session.redirect_to || utils.url_for('/'); dblink.user.login(user, req.session, function(status) {
        /* login fail */
        if (status == 0) {
            return res.render('layout', {
                layout: 'login',
                subtitle: 'Login',
                sysmsg: '帳號或密碼錯誤'
            });
        }
        /* login success */
        var uid = req.session.uid;
        var filter_ip = iplist.filter(function(valid_ip) {
            return ip == valid_ip;
        });
        /**
            enter judge privilege:
              1. contest not running
              2. contest running and user is a participant
         */
        if (config.CONTEST.MODE == false || filter_ip.length != 0 || req.session['class'] == null) {
            dblink.user.update_login(uid, ip, function() {
                res.redirect(backURL);
            });
        } else {
            req.session.regenerate(function(err) {
                res.render('layout', {
                    layout: 'login',
                    subtitle: 'Login',
                    sysmsg: '考試正在進行'
                });
            });
        }
    });
});
/* User Logout and regenerate session */
router.get('/logout', function(req, res, next) {
    req.session.regenerate(function(err) {
        res.redirect(utils.url_for('/'));
    });
});
router.get('/edit', function(req, res, next) {
    var uid = req.session.uid;
    dblink.user.info(uid, function(user) {
        var wrongmsg = '';
        res.render('layout', {
            layout: 'edit',
            subtitle: 'Profile',
            userinfo: user,
            sysmsg: wrongmsg
        });
    });
});
router.post('/edit', function(req, res, next) {
    if (req.body.pwd != req.body.repwd) {
        var wrongmsg = 'The new password is not equal to the retype new password.';
        dblink.user.info(req.session.uid, function(user) {
            res.render('layout', {
                layout: 'edit',
                subtitle: 'Profile',
                userinfo: user,
                sysmsg: wrongmsg
            });
        });
    } else {
        var user = {
            uid: req.session.uid,
            pwd: req.body.pwd,
            motto: req.body.motto
        };
        dblink.user.update_info(user, function(status) {
            dblink.user.info(user.uid, function(user) {
                res.render('layout', {
                    layout: 'edit',
                    subtitle: 'Profile',
                    userinfo: user,
                    sysmsg: status
                });
            });
        });
    }
});
router.get('/user', function(req, res, next) {
    res.render('layout', {
        layout: 'user'
    });
});

router.get('/signup', function(req, res, next) {
    res.render('layout', {
        layout: 'signup',
        user: req.session,
        sysmsg: ''
    });
});
router.post('/register', function(req, res, next) {
    var user = {
        lgn: req.body.lgn,
        pwd: req.body.pwd,
        pwd2: req.body.pwd2,
        nname: req.body.nname,
        email: req.body.email,
        code: req.body.code
    };
    if (req.body.pwd != req.body.pwd2) {
        var wrongmsg = 'Password not equals';
        res.render('layout', {
            layout: 'register',
            sysmsg: wrongmsg
        });
    } else {
        dblink.user.add_user(user, function(status, wrongmsg) {
            if (status == 1) {
                res.redirect(utils.url_for('/login'));
            } else {
                res.render('layout', {
                    layout: 'register',
                    sysmsg: wrongmsg
                });
            }
        });
    }
});
/* Navigation Bar */
router.get('/archive', function(req, res, next) {
    res.redirect(utils.url_for('/'));
});
router.get('/ranklist?', function(req, res, next) {
    dblink.rank.list(req.query, function(rlist) {
        dblink.rank.listsize(function(rsize) {
            res.render('layout', {
                layout: 'ranklist',
                subtitle: 'Rank',
                rank_list: rlist,
                query_filter: req.query,
                rank_size: rsize
            });
        });
    })
});
router.get('/progress', function(req, res, next) {
    dblink.rank.progress(function(rlist) {
        res.render('layout', {
            layout: 'progress',
            rank_list: rlist
        });
    });
})
router.get('/submissions?', function(req, res, next) {
    var uid = req.session.uid;
    dblink.submission.list(req.query, function(slist) {
        dblink.submission.listinfo(req.query, function(slist_status) {
            dblink.problemManager.scoreboard(uid, function(ac_list) {
                res.render('layout', {
                    layout: 'submissions',
                    subtitle: 'Submission',
                    query_filter: req.query,
                    submission_list: slist,
                    submission_status: slist_status,
                    ac_list: ac_list
                });
            });
        });
    });
});
router.get('/live', function(req, res, next) {
    res.render('layout', {
        layout: 'live',
        subtitle: 'Live',
        query_filter: req.query,
        request_hostname: req.hostname
    });
});
router.get('/problems/domains', function(req, res, next) {
    res.render('layout', {
        layout: 'domains',
        subtitle: 'Domain Set'
    });
});
router.get('/problems/domain/:did', function(req, res, next) {
    var did = req.params.did;
    dblink.problemManager.domainLevelList(did, function(lvList) {
        dblink.problemManager.levelProgress(req.session && req.session.uid, did, function(lvProgress) {
            res.render('layout', {
                layout: 'problem_domain',
                subtitle: 'Problem Set',
                level_list: lvList,
                domain_id: did,
                level_progress: lvProgress,
                request_hostname: req.hostname
            });
        });
    });
});
router.get('/problem/:cid/:pid', function(req, res, next) {
    var cid = req.params.cid,
        pid = req.params.pid,
        uid = req.session.uid;
    var loadPage = function() {
        dblink.problemManager.problemContent(pid, function(pcontent, pinfo, psubmit) {
            dblink.problemManager.testdataList(pid, function(tconfig) {
                dblink.helper.cansubmit(cid, pid, uid, function(cansubmit) {
                    if (uid != undefined && req.session['class'] == null)
                        cansubmit = true;
                    var ttl = pinfo && pinfo[0] && pinfo[0].ttl;
                    res.render('layout', {
                        layout: 'problem',
                        subtitle: pid + '. ' + ttl,
                        problem_content: pcontent,
                        pinfo: pinfo[0],
                        cid: cid,
                        psubmit: psubmit,
                        testdata_config: tconfig,
                        canSubmit: cansubmit
                    });
                });
            });
        });
    };
    dblink.helper.canread(cid, pid, uid, function(can) {
        if (uid != undefined && req.session['class'] == null)
            can = true;
        if (!can)
            return res.redirect(utils.url_for('problems/domains'));
        loadPage();
    });
});
router.get('/solution/problem/:pid', function(req, res, next) {
    var cid = 0,
        pid = req.params.pid,
        uid = req.session.uid;
    dblink.helper.canread(cid, pid, uid, function(can) {
        if (uid != undefined && req.session['class'] == null)
            can = true;
        if (!can)
            return res.redirect(utils.url_for('problems/domains'));
        dblink.problemManager.problemSolution(pid, function(solution_config) {
            res.render('layout', {
                layout: 'solution',
                subtitle: 'Solution',
                solution_config: solution_config
            });
        });
    });
});
router.get('/statistic/problem/:cid/:pid', function(req, res, next) {
    var cid = req.params.cid,
        pid = req.params.pid,
        uid = req.session.uid;
    var loadPage = function() {
        dblink.problemManager.problemContent(pid, function(pcontent, pinfo, psubmit) {
            dblink.statistic.statistic_donut(cid, pid, function(donut_config) {
                dblink.statistic.submission_table(cid, pid, function(tried_config) {
                    dblink.statistic.best_submission(cid, pid, function(best_config) {
                        res.render('layout', {
                            layout: 'problem_statistic',
                            subtitle: 'Statistic',
                            pinfo: pinfo[0],
                            donut_config: donut_config,
                            tried_config: tried_config,
                            best_config: best_config
                        });
                    });
                });
            });
        });
    };
    dblink.helper.canread(cid, pid, uid, function(can) {
        if (!can)
            return res.redirect('/problems');
        loadPage();
    });
});
router.get('/statistic/grade/problem/:cid/:pid', function(req, res, next) {
    var cid = req.params.cid,
        pid = req.params.pid,
        uid = req.session.uid;
    var loadPage = function() {
        dblink.problemManager.problemContent(pid, function(content, pconfig) {
            dblink.statistic.grade_problem(cid, pid, function(sconfig) {
                res.render('layout', {
                    layout: 'grade_problem',
                    statistic_config: sconfig,
                    problem_config: pconfig[0]
                });
            });
        });
    };
    dblink.helper.isAdmin(uid, function(isadmin) {
        if (!isadmin)
            return res.redirect(utils.url_for('login'));
        loadPage();
    });
});

router.get('/contests?', function(req, res, next) {
    dblink.contest.list(req.query, req.session.uid, function(clist) {
        dblink.contest.listsize(req.query, req.session.uid, function(csize) {
            res.render('layout', {
                layout: 'contests',
                subtitle: 'Contest',
                contest_list: clist,
                query_filter: req.query,
                contest_size: csize
            });
        });
    });
});
router.get('/contest/:cid', function(req, res, next) {
    var cid = req.params.cid,
        uid = req.session.uid;
    dblink.contest.enable(cid, uid, function(status, contest_config, sysmsg) {
        if (uid != undefined && req.session['class'] == null)
            status = 1; // can
        if (status == 1) {
            dblink.contest.problemlist(cid, uid, function(status, problem_config) {
                dblink.contest.rule(cid, function(contest_rule_desc) {
                    res.render('layout', {
                        layout: 'contest',
                        sysmsg: sysmsg,
                        contest_config: contest_config,
                        contest_rule_desc: contest_rule_desc,
                        problem_config: problem_config
                    });
                });
            });
        } else {
            dblink.contest.rule(cid, function(contest_rule_desc) {
                res.render('layout', {
                    layout: 'contest',
                    sysmsg: sysmsg,
                    contest_config: contest_config,
                    contest_rule_desc: contest_rule_desc,
                    problem_config: {}
                });
            });
        }
    });
});
router.get('/scoreboard/contest/:cid', function(req, res, next) {
    var cid = req.params.cid,
        uid = req.session.uid;
    dblink.contest.enable(cid, uid, function(status, contest_config, sysmsg) {
        if (status == 0) {
            res.redirect(utils.url_for('/contest/' + cid));
        } else {
            dblink.contest.scoreboard(cid, uid, function(table_config) {
                res.render('layout', {
                    layout: 'scoreboard',
                    subtitle: 'Scoreboard',
                    table_config: table_config
                });
            });
        }
    })
});

router.post('/submit',
    upload.fields([{
        name: 'code0',
        maxCount: 1
    }, {
        name: 'code1',
        maxCount: 1
    }, {
        name: 'code2',
        maxCount: 1
    }, {
        name: 'code3',
        maxCount: 1
    }, {
        name: 'code4',
        maxCount: 1
    }, {
        name: 'code5',
        maxCount: 1
    }, {
        name: 'code6',
        maxCount: 1
    }, {
        name: 'code7',
        maxCount: 1
    }]),
    function(req, res, next) {
        if (req.session.uid === undefined || req.session.uid < 0)
            return res.redirect(utils.url_for('/login'));

        var cid = req.body.cid,
            pid = req.body.pid,
            lng = req.body.lng;
        var uid = req.session.uid;
        if (lng == undefined) // multi file
            lng = 0;
        if (lng != 0)
            req.session.submit_lng = lng;
        var submitStep = function() {
            dblink.problemManager.sourceList(pid, function(source_list) {
                if (source_list.length === 0)
                    source_list.push("source");
                var size = 0;
                for (var i = 0; i < source_list.length; i++) {
                    var file_size = 0;
                    if (req.files['code' + i] == null || req.files['code' + i] == undefined ||
                        req.files['code' + i][0] == null || req.files['code' + i][0] == undefined) {
                        if (req.body['paste_code' + i].length > 65536 || req.body['paste_code' + i].trim().length == 0) {
                            console.log('NOT FOUND FILE ' + i);
                            return res.redirect(utils.url_for('/'));
                        } else {
                            file_size = req.body['paste_code' + i].length;
                        }
                    } else {
                        file_size = req.files['code' + i][0].size;
                    }
                    size += file_size;
                }
                /**
                 * JUDGE result8 : SAVING
                 */
                var subinfo = {
                    uid: uid,
                    cid: cid,
                    pid: pid,
                    ts: Date.now(),
                    lng: lng,
                    len: size,
                    scr: 0,
                    res: 8,
                    cpu: 0,
                    mem: 0
                };
                dblink.judge.insert_submission(subinfo, function(sid) {
                    for (var i = 0; i < source_list.length; i++) {
                        if (req.files['code' + i] == null || req.files['code' + i] == undefined ||
                            req.files['code' + i][0] == null || req.files['code' + i][0] == undefined) {
                            fs.writeFileSync(config.JUDGE.path + "submission/" + sid + "-" + i, req.body['paste_code' + i]);
                        } else {
                            fs.writeFileSync(config.JUDGE.path + "submission/" + sid + "-" + i, fs.readFileSync(req.files['code' + i][0].path));
                            fs.unlinkSync(req.files['code' + i][0].path);
                        }
                    }

                    dblink.judge.update_waiting_submission(sid, function(err) {
                        if (cid === "0")
                            return res.redirect(utils.url_for('live'));
                        else
                            return res.redirect(utils.url_for('live?cid=' + cid));
                    });

                });

            });
        };
        dblink.helper.cansubmit(cid, pid, uid, function(canSubmit) {
            if (req.session['class'] == null)
                canSubmit = true;
            if (!canSubmit)
                return res.redirect(utils.url_for('/'));
            submitStep();
        });
    });
/* Helper */
router.get('/time', function(req, res, next) {
    res.send(new Date());
});

router.get('/score', function(req, res, next) {
    var uid = req.session.uid;
    dblink.helper.isAdmin(uid, function(isAdmin) {
        dblink.user.info(req.session.uid, function(user) {
            dblink.score.statistic(function(score_statistic) {
                if (isAdmin) {
                    dblink.score.getAll(function(score) {
                        res.render('layout', {
                            layout: 'score',
                            subtitle: 'Score',
                            score: score,
                            userinfo: user,
                            score_statistic: score_statistic
                        });
                    });
                } else {
                    dblink.score.getOne(uid, function(score) {
                        res.render('layout', {
                            layout: 'score',
                            subtitle: 'Score',
                            score: score,
                            userinfo: user,
                            score_statistic: score_statistic
                        });
                    });
                }
            });
        });
    });
});

var sourceRouter = require('./source'),
    apiRouter = require('./api'),
    testdataRouter = require('./testdata');

router.use('/source', sourceRouter);
router.use('/api', apiRouter);
router.use('/testdata', testdataRouter);

module.exports = router;
