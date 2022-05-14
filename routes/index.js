var express = require('express');
var router = express.Router();
var dblink = require('../lib/components/dblink');
var multer = require('multer');
var _config = require('../lib/config').config;
var utils = require('../lib/components/utils');
var fs = require('fs');
const { StatusCodes } = require('http-status-codes');

const { loggerFactory } = require('lib/components/logger/LoggerFactory');

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

function renderError({
    res,
    title = "NOT FOUND",
    message = "Error.",
    status = "",
    extraMessage = ""
}={}) {
    return res.render('error2', { title, message, status, extraMessage });
}

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
            const msg = `Restart server with throwing an error. admin: ${uid}.`;
            loggerFactory.getLogger(module.id).info(msg);
            throw new Error(msg);
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
    var backURL = req.session.redirect_to || utils.url_for('/');

    let logger = loggerFactory.getLogger(module.id);
    logger.info(`Login request: (${user["lgn"]}, ${ip})`);

    dblink.user.login(user, req.session, function(status) {
        /* login fail */
        if (status == 0) {
            logger.info('Wrong password.');
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
        if (_config.CONTEST.MODE == false || filter_ip.length != 0 || req.session['class'] == null) {
            dblink.user.update_login(uid, ip, function() {
                res.redirect(backURL);
            });
        } else {
            logger.info('Blocked by test mode.');
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
    let uid = req.session.uid;
    if (uid)
        loggerFactory.getLogger(module.id).info(`logout: ${uid} ${req.session.lgn}.`);

    req.session.regenerate(function(err) {
        res.redirect(utils.url_for('/'));
    });
});
router.get('/edit', function(req, res, next) {
    var uid = req.session.uid;

    if (uid === undefined)
        throw new Error('Try to edit user profile without login.');

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

        let mottoLenghtLimit = _config.JUDGE.MOTTO_LENGTH_LIMIT;
        if (user.motto.length > mottoLenghtLimit) {
            let message = `Mottos should contain no more than ${mottoLenghtLimit} characters. The new motto has ${user.motto.length} characters.`
            return renderError({ res, title: "Forbidden", message });
        }

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
    let selfId = req.session.uid;
    let isTestMode = _config.CONTEST.MODE == true;
    let noClass = req.session['class'] == null;
    let renderForbidden = function() {
        res.render('layout', {
            layout: 'forbidden',
            subtitle: 'Forbidden',
            sysmsg: '考試中，禁止查詢 ranklist。'
        });
    };

    if (!isTestMode || noClass) {
        let renderRankList = function(rlist) {
            let resizeRankList = function(rsize) {
                let layoutObj = {
                    layout: 'ranklist',
                    subtitle: 'Rank',
                    rank_list: rlist,
                    query_filter: req.query,
                    rank_size: rsize
                };

                res.render('layout', layoutObj);
            };

            dblink.rank.listsize(resizeRankList);
        }

        let callback = function(isAdmin) {
            if (!isAdmin && isTestMode) {
                renderForbidden();
            }
            dblink.rank.list(req.query, renderRankList);
        }

        dblink.helper.isAdmin(selfId, callback);

    } else
        renderForbidden();
});

router.get('/progress', function(req, res, next) {
    dblink.rank.progress(function(rlist) {
        res.render('layout', {
            layout: 'progress',
            rank_list: rlist
        });
    });
});

router.get('/submissions?', function(req, res, next) {
    var uid = req.session.uid;
    dblink.helper.isAdmin(uid, function(isAdmin) {
        dblink.helper.isStrong(uid, function(isStrong) {
            dblink.submission.list(req.query, isAdmin, isStrong, function(slist) {
                dblink.submission.listinfo(req.query, isAdmin, isStrong, function(slist_status) {
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
    });
});

router.get('/live', function(req, res, next) {
    res.render('layout', {
        layout: 'live',
        subtitle: 'Live',
        query_filter: req.query,
        request_hostname: req.get('host')
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
                request_hostname: req.get('host')
            });
        });
    });
});

router.get('/problem/:cid/:pid', function(req, res, next) {
    var cid = req.params.cid,
        pid = req.params.pid,
        uid = req.session.uid;

    let judge_compiler_arg, judge_lng;
    if (pid == "4") {
        judge_compiler_arg = ['none', 'gcc -std=c99 -O2', 'g++ -std=c++11'];
        judge_lng = ['*', 'C', 'C++'];
    } else {
        judge_compiler_arg = _config.JUDGE.compiler_arg;
        judge_lng = ['*', 'C'];
    }

    var loadPage = function() {
        dblink.problemManager.problemContent(pid, function(pcontent, pinfo, psubmit) {
            // 404 if no static problem found.
            if (pinfo === null || pinfo === undefined) {
                let err = new Error(pcontent);
                err.status = StatusCodes.NOT_FOUND;

                next(err);
                return;
            }

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
                        canSubmit: cansubmit,
                        judge_compiler_arg: judge_compiler_arg,
                        judge_lng: judge_lng
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

router.get('/solution/problem/:cid/:pid', function(req, res, next) {
    var cid = req.params.cid,
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
    dblink.helper.isAdmin(uid, function(isAdmin) {
        if (!isAdmin)
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

router.get('/contest/:cid', async function(req, res, next) {
    var cid = req.params.cid,
        uid = req.session.uid;

    // to prevent the following error caused by invalid cid
    let contest = await dblink.contest.promise.getContest(cid);
    if (contest.length !== 1)
        return renderError({ res, title: `Invalid contest id: ${cid}` });

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

router.get('/scoreboard/contest/:cid', async function(req, res, next) {
    var cid = req.params.cid,
        uid = req.session.uid;

    let permission = await dblink.contest.promise.canViewContest(cid, uid);
    if (permission.statusCode !== 1)
        return res.redirect(utils.url_for('/contest/' + cid));

    let scoreboard = await dblink.contest.promise.getScoreboard(cid, uid);
    res.render('layout', {
        layout: 'scoreboard',
        subtitle: 'Scoreboard',
        table_config: scoreboard
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
            if (user.info == undefined)
                return renderError({res, title: 'Invalid user'});

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
    testdataRouter = require('./testdata'),
    reportRouter = require('./report'),
    submitRouter = require('./submit');

router.use('/source', sourceRouter);
router.use('/api', apiRouter);
router.use('/testdata', testdataRouter);
router.use('/report', reportRouter);
router.use('/submit', submitRouter);

module.exports = router;
