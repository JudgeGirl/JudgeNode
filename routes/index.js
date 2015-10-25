var express = require('express');
var router = express.Router();
var dblink = require('../lib/dblink');
var multer = require('multer');
var upload = multer({dest: 'files/'});
var _config = require('../lib/const');
var fs = require('fs');

/* GET home page, default /archive */
router.get('/', function(req, res, next) {
	dblink.archive.list(function(acontent) {
		res.render('layout', { layout: 'archive', user: req.session, archive_content: acontent });
	});
});

router.get('/restart', function(req, res, next){
	var uid = req.session.uid;
	dblink.helper.isAdmin( uid, function(isAdmin){
		if( isAdmin ){
			throw new Exception();
		}
		else {
			res.redirect('/');
		}
	});	
});

/* User Information control */
router.get('/login', function(req, res, next) {
	res.render('layout', { layout: 'login', user: req.session, sysmsg: '' });
});
router.post('/login', function(req, res, next) {
	var user = {
		lgn : req.body.lgn,
		pwd : req.body.pwd
	};
	var iplist = _config.CONTEST_IP;
	var ip = req.ip;
	dblink.user.login(user, req.session, function(status) {
		if (status == 1) {
			var uid = req.session.uid;
			var filter_ip = iplist.filter(function(valid_ip) {
				return ip == valid_ip;
			});
			if (config.CONTEST_MODE == false || filter_ip.length != 0 || req.session['class'] == null) {
				dblink.user.update_login(uid, ip, function() {
					res.redirect('/');
				});
			} else {
				req.session.regenerate(function(err) {
					res.render('layout', { layout: 'login', user: req.session, sysmsg: '考試正在進行' });
				});
			}
		} else {
			res.render('layout', { layout: 'login', user: req.session, sysmsg: '帳號或密碼錯誤' });
		}
	});
});
router.get('/logout', function(req, res, next) {
	req.session.regenerate(function(err) {
		res.redirect('/');
	});
});
router.get('/edit', function(req, res, next) {
	var uid = req.session.uid;
	dblink.user.info(uid, function(user) {
		var wrongmsg = '';
		res.render('layout', { layout: 'edit', subtitle: 'Profile', user: req.session, userinfo: user, sysmsg: wrongmsg});
	});
});
router.post('/edit', function(req, res, next) {
	if (req.body.pwd != req.body.repwd) {
		var wrongmsg = 'The new password is not equal to the retype new password.';
		dblink.user.info(req.session.uid, function(user) {
			res.render('layout', { layout: 'edit', user: req.session, userinfo: user, sysmsg: wrongmsg});
		});
	} else {
		var user = {
			uid: req.session.uid,
			pwd: req.body.pwd,
			motto: req.body.motto
		};
		dblink.user.update_info(user, function(status) {
			dblink.user.info(user.uid, function(user) {
				res.render('layout', { layout: 'edit', user: req.session, userinfo: user, sysmsg: status});
			});
		});
	}
});
router.get('/user', function(req, res, next) {
	res.render('layout', { layout: 'user', user: req.session});
});
/*
router.get('/register', function(req, res, next) {
	res.render('layout', { layout: 'register', user: req.session, sysmsg: '' });
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
	dblink.user.add_user(user, function(status) {
		if (status == 1) {
			res.render('layout', { layout: 'register', user: req.session , sysmsg: 'success'});
		} else {
			res.render('layout', { layout: 'register', user: req.session , sysmsg: 'fail'});
		}
	});
});
*/
/* Navigation Bar */
router.get('/archive', function(req, res, next) {
	dblink.archive.list(function(acontent) {
		res.render('layout', { layout: 'archive', user: req.session, archive_content: acontent });
	});
});
router.get('/ranklist', function(req, res, next) {
	dblink.rank.list(function(rlist) {
		res.render('layout', { layout: 'ranklist', subtitle: 'Rank', user: req.session, rank_list : rlist });
	})
});
router.get('/progress', function(req, res, next) {
	dblink.rank.progress(function(rlist) {
		res.render('layout', { layout: 'progress', user: req.session, rank_list : rlist });
	});
})
router.get('/submissions?', function(req, res, next) {
	var uid = req.session.uid;
	dblink.submission.list(req.query, function(slist) {
		dblink.problem.score(uid, function(ac_list) {
			res.render('layout', { layout: 'submissions', subtitle: 'Submission', user: req.session, query_filter: req.query, submission_list: slist, ac_list: ac_list});
		});
	});
});
router.get('/live', function(req, res, next) {
	res.render('layout', { layout: 'live', subtitle: 'Live', user: req.session, query_filter: req.query});
});
router.get('/problems', function(req, res, next) {
	dblink.problem.level(function(llist){
		dblink.problem.list(function(plist) {
			dblink.problem.dependency(function(depend){
				dblink.problem.score(req.session && req.session.uid , function(score){
					dblink.statistic.submissions_count( function(submissions){ 
						res.render('layout', { layout: 'problems', subtitle: 'Problem Set', user: req.session , problem_list: plist, level_list: llist, score: score, depend: depend, submissions: submissions });
					});
				});
			});
		});
	});
});
router.get('/problem/:cid/:pid', function(req, res, next) {
	var cid = req.params.cid, 
		pid = req.params.pid,
		uid = req.session.uid;
	dblink.helper.canread(cid, pid, uid, function(can) {
		if (uid != undefined && req.session['class'] == null)
			can = true;
		if (!can)
			return res.redirect('/problems');
		dblink.problem.problem(cid, pid, function(pcontent, pinfo, psubmit) {
			dblink.problem.testdata(pid, function(tconfig) {
				dblink.helper.cansubmit(cid, pid, uid, function(cansubmit){
					if (uid != undefined && req.session['class'] == null)
						cansubmit = true;
					var ttl = pinfo && pinfo[0] && pinfo[0].ttl;
					res.render('layout', { layout: 'problem', subtitle: pid + '. ' + ttl, user: req.session , problem_content: pcontent, 
						ttl: ttl, cid: cid, pid: pid, uid: uid, 
						psubmit: psubmit, testdata_config: tconfig, canSubmit: cansubmit});
				});
			});
		});
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
			return res.redirect('/problems');
		dblink.problem.solution(cid, pid, function(solution_config) {
			res.render('layout', { layout: 'solution', user: req.session, solution_config: solution_config});
		});
	});
});
router.get('/statistic/problem/:cid/:pid', function(req, res, next) {
	var cid = req.params.cid, 
		pid = req.params.pid,
		uid = req.session.uid;

	dblink.helper.canread(cid, pid, uid, function(can) {
		if (!can)
			return res.redirect('/problems');
		dblink.problem.problem(cid, pid, function(pcontent, pinfo, psubmit) {
			dblink.statistic.statistic_donut(cid, pid, function(donut_config) {
				dblink.statistic.submission_table(cid, pid, function(tried_config) {
					dblink.statistic.best_submission(cid, pid, function(best_config) {
						res.render('layout', { layout: 'problem_statistic', subtitle: 'Statistic', user: req.session, 
								cid: cid, pid: pid, ttl: pinfo && pinfo[0] && pinfo[0].ttl, 
								donut_config : donut_config, tried_config: tried_config, best_config: best_config});
					});
				});				
			});
		});
	});
});
router.get('/statistic/grade/problem/:cid/:pid', function(req, res, next) {
	var cid = req.params.cid, 
		pid = req.params.pid,
		uid = req.session.uid;
	dblink.helper.isAdmin(uid, function(isadmin) {
		if (!isadmin)
			return res.redirect('/login');
		dblink.problem.problem(cid, pid, function(content, pconfig) {
			pconfig = pconfig[0];
			dblink.statistic.grade_problem(cid, pid, function(sconfig) {
				res.render('layout', { layout: 'grade_problem', user: req.session, statistic_config: sconfig, problem_config: pconfig});
			});
		});
	});
});

router.get('/contests', function(req, res, next) {
	dblink.contest.list(req.session.uid, function(clist) {
		res.render('layout', { layout: 'contests', subtitle: 'Contest', user: req.session, contest_list: clist});
	});
});
router.get('/contest/:cid', function(req, res, next) {
	var cid = req.params.cid,
		uid = req.session.uid;
	dblink.contest.enable(cid, uid, function(status, contest_config, sysmsg) {
		if (uid != undefined && req.session['class'] == null)
			status = 1;	// can
		if (status == 1) {
			dblink.contest.problemlist(cid, uid, function(status, problem_config) {
				res.render('layout', { layout: 'contest', user: req.session, sysmsg: sysmsg, contest_config: contest_config, problem_config: problem_config});
			});
		} else {
			res.render('layout', { layout: 'contest', user: req.session, sysmsg: sysmsg, contest_config: contest_config, problem_config: {} });
		}
	});
});
router.get('/scoreboard/contest/:cid', function(req, res, next) {
	var cid = req.params.cid,
		uid = req.session.uid;
	dblink.contest.enable(cid, uid, function(status, contest_config, sysmsg) {
		if (status == 0) {
			res.redirect('/contest/' + cid);
		} else {
			dblink.contest.scoreboard(cid, uid, function(table_config) {
				res.render('layout', { layout: 'scoreboard', subtitle: 'Scoreboard', user: req.session, table_config: table_config});
			});
		}
	})
});

router.post('/submit', 
	upload.fields([{name: 'code0', maxCount: 1}, {name: 'code1', maxCount: 1},
				   {name: 'code2', maxCount: 1}, {name: 'code3', maxCount: 1},
				   {name: 'code4', maxCount: 1}, {name: 'code5', maxCount: 1},
				   {name: 'code6', maxCount: 1}, {name: 'code7', maxCount: 1}]), 
	function(req, res, next){
	if (req.session.uid < 0 || req.session.uid === undefined) {
		return res.redirect("/login");
	}
	
	var cid = req.body.cid;
	var pid = req.body.pid;
	var lng = req.body.lng;
	var uid = req.session.uid;	
	if (lng == undefined) // multi file
		lng = 0;
	dblink.helper.cansubmit( cid, pid, uid, function(canSubmit) {
		if (req.session['class'] == null)
			canSubmit = true;
		if (!canSubmit)
			return res.redirect("/");

		dblink.problem.problem_config( pid, function(source_list) {
			if (source_list.length === 0) {
				source_list.push("source");
			}
			
			console.log(source_list);
			var size = 0;
			for (var i = 0 ; i < source_list.length; i++) {
				if (req.files['code' + i] == null || req.files['code' + i] == undefined || 
					req.files['code' + i][0] == null || req.files['code' + i][0] == undefined) {
					console.log('NOT FOUND FILE ' + i);
					return res.redirect("/");
				}
				size += req.files['code' + i][0].size;
			}	
			
			var subinfo = {
				uid: uid,
				cid: cid,
				pid: pid,
				ts: Date.now(),
				lng: lng,
				len: size,
				scr: 0,
				res: 8,	// JUDGE result : SAVING
				cpu: 0,
				mem: 0 
			};

			dblink.judge.insert_submission(subinfo, function(sid) {
				for (var i = 0 ; i < source_list.length ; i++) {
					fs.writeFileSync(config.JUDGE_PATH + "submission/" + sid + "-" + i,  fs.readFileSync(req.files['code' + i][0].path) );
					fs.unlinkSync(req.files['code' + i][0].path);
				}
				
				dblink.judge.update_waiting_submission(sid, function(err) {
					if (cid === "0")
						return res.redirect("/submissions");
					else
						return res.redirect("/submissions?cid=" + cid);
				});	
				
			});
			
		});
	});

});
/* Helper */
router.get('/time', function(req, res, next) {
	res.send(new Date());
});
router.get('/detail/:sid', function(req, res, next) {
	var sid = req.params.sid;
	dblink.submission.source_result_html(sid, req.session.uid, req.session["class"], function(source_result) {
		// res.type('text/plain');
		res.render('layout', {layout: 'detail', user: req.session, sid: sid, html_code: source_result });
	});
});

router.get('/source/:sid', function(req, res, next) {
	var sid = req.params.sid;
	dblink.submission.source_code(sid, req.session.uid, req.session["class"], function(source_code) {
		res.type('text/plain');
		var text = '';
		for (var i in source_code)
			text += source_code[i].code + '\n';
		res.send(text);
	});
});
var markdown = require('../lib/plugin/markdown');
router.get('/source/highlight/:sid', function(req, res, next) {
	var sid = req.params.sid;
	dblink.submission.source_code(sid, req.session.uid, req.session["class"], function(source_code) {
		var text = '';
		for (var i in source_code) {
			text += '## ' + source_code[i].title + ' ##\n';
			text += '```cpp\n' + source_code[i].code + '```\n';
		}
		dblink.submission.list({sid: sid}, function(slist) {
			res.render('layout', {layout: 'highlight', user: req.session, sid: sid, 
				html_code: markdown.post_marked(text),
				subs_info: slist && slist.length > 0 ? slist[0] : null });
		});
	});
});


router.get('/score', function(req, res, next){
	var uid = req.session.uid;
	dblink.helper.isAdmin( uid, function(isAdmin){
		dblink.user.info(req.session.uid, function(user) {
			dblink.score.statistic(function(score_statistic) {
				if (isAdmin) {
					dblink.score.getAll(function(score) {
						res.render('layout', {layout: 'score', subtitle: 'Score', user: req.session, 
												score: score, userinfo: user, score_statistic: score_statistic});
					});	
				} else {
					dblink.score.getOne(uid, function(score) {
						res.render('layout', {layout: 'score', subtitle: 'Score', user: req.session, 
												score: score, userinfo: user, score_statistic: score_statistic});
					});
				}
			});
		});
	});	
});

router.get('/api/submissions?', function(req, res, next) {
	dblink.api.list(req.query, function(result) {
		res.json(result);
	});
});
router.get('/api/result?', function(req, res, next) {
	var sid = req.query.sid;
	if (sid == undefined || sid == null)	sid = 0;
	dblink.api.result(sid, function(result) {
		res.json(result);
	});
});
module.exports = router;
