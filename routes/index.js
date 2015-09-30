var express = require('express');
var router = express.Router();
var dblink = require('../lib/dblink');
var config = require('../lib/const');
var multer = require('multer');
var upload = multer({dest: 'files/'});
var fs = require('fs');
var hl = require('node-syntaxhighlighter');

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
	res.render('layout', { layout: 'login', user: req.session });
});
router.post('/login', function(req, res, next) {
	var user = {
		lgn : req.body.lgn,
		pwd : req.body.pwd
	};
	var getIpAddress = function (req) {
	   return (req.headers["X-Forwarded-For"] ||
	            req.headers["x-forwarded-for"] ||
	            '').split(',')[0] ||
	           req.client.remoteAddress;
	};
	var ip = getIpAddress(req);
	dblink.user.login(user, req.session, function(status) {
		if (status == 1) {
			var uid = req.session.uid;
			dblink.user.update_login(uid, ip, function() {
				res.redirect('/');
			});
		} else {
			res.render('layout', { layout: 'login', user: req.session });
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
		res.render('layout', { layout: 'edit', user: req.session, config: config, userinfo: user, sysmsg: wrongmsg});
	});
});
router.post('/edit', function(req, res, next) {
	if (req.body.pwd != req.body.repwd) {
		var wrongmsg = 'The new password is not equal to the retype new password.';
		dblink.user.info(req.session.uid, function(user) {
			res.render('layout', { layout: 'edit', user: req.session, config: config, userinfo: user, sysmsg: wrongmsg});
		});
	} else {
		var user = {
			uid: req.session.uid,
			pwd: req.body.pwd,
			motto: req.body.motto
		};
		dblink.user.update_info(user, function(status) {
			dblink.user.info(user.uid, function(user) {
				res.render('layout', { layout: 'edit', user: req.session, config: config, userinfo: user, sysmsg: status});
			});
		});
	}
});
router.get('/user', function(req, res, next) {
	res.render('layout', { layout: 'user', user: req.session, config: config });
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
		res.render('layout', { layout: 'ranklist', user: req.session, rank_list : rlist });
	})
});
router.get('/progress', function(req, res, next) {
	dblink.rank.progress(function(rlist) {
		res.render('layout', { layout: 'progress', user: req.session, rank_list : rlist });
	});
})
router.get('/submissions?', function(req, res, next) {
	dblink.submission.list(req.query, function(slist) {
		res.render('layout', { layout: 'submissions', user: req.session, query_filter: req.query, config: config,  submission_list: slist });
	});
});
router.get('/live', function(req, res, next) {
	res.render('layout', { layout: 'live', user: req.session, query_filter: req.query, config: config});
});
router.get('/problems', function(req, res, next) {
	dblink.problem.level(function(llist){
		dblink.problem.list(function(plist) {
			dblink.problem.dependency(function(depend){
				dblink.problem.score(req.session && req.session.uid , function(score){
					dblink.statistic.submissions_count( function(submissions){ 
						res.render('layout', { layout: 'problems', user: req.session , problem_list: plist, level_list: llist, score: score, depend: depend, submissions: submissions });
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
		if (!can) {
			res.redirect('/problems');
			return 0;
		}
		dblink.problem.problem(cid, pid, function(pcontent, pinfo, psubmit) {
			dblink.helper.cansubmit(cid, pid, uid, function(cansubmit){
				if (uid != undefined && req.session['class'] == null)
					cansubmit = true;
				res.render('layout', { layout: 'problem', user: req.session , problem_content: pcontent, ttl: pinfo && pinfo[0] && pinfo[0].ttl, cid: cid, pid: pid, uid: uid, psubmit: psubmit, canSubmit: cansubmit, config: config});
			});
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
						res.render('layout', { layout: 'problem_statistic', user: req.session, config: config, 
								cid: cid, pid: pid, ttl: pinfo && pinfo[0] && pinfo[0].ttl, 
								donut_config : donut_config, tried_config: tried_config, best_config: best_config});
					});
				});				
			});
		});
	});
});

router.get('/contests', function(req, res, next) {
	dblink.contest.list(req.session.uid, function(clist) {
		res.render('layout', { layout: 'contests', user: req.session, config: config, contest_list: clist});
	});
});
router.get('/contest/:cid', function(req, res, next) {
	var cid = req.params.cid,
		uid = req.session.uid;
	dblink.contest.enable(cid, uid, function(status, contest_config, sysmsg) {
		dblink.contest.problemlist(cid, uid, function(status, problem_config) {
			res.render('layout', { layout: 'contest', user: req.session, sysmsg: sysmsg, contest_config: contest_config, problem_config: problem_config});
		});
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
				res.render('layout', { layout: 'scoreboard', user: req.session, table_config: table_config});
			});
		}
	})
});

router.post('/submit', upload.array('code'), function(req, res, next){
	if( req.session.uid < 0 || req.session.uid === undefined ){
		res.redirect("/login");
		return 0;
	}
	
	var cid = req.body.cid;
	var pid = req.body.pid;
	var lng = req.body.lng;
	var uid = req.session.uid;	

	dblink.helper.cansubmit( cid, pid, uid, function(canSubmit) {
		if (req.session['class'] == null)
			canSubmit = true;
		if( !canSubmit ){
			res.redirect("/");
			return 0;
		}

		dblink.problem.problem_config( pid, function(source_list){
			if( source_list.length === 0 ){
				source_list.push("source");
			}
			
			var size = 0;
			for( var i = 0 ; i < source_list.length ; i++ ){
				if (req.files[i] == null || req.files[i] == undefined) {
					res.redirect("/");
					return 0;
				}
				size += req.files[i].size;
			}	
			
			var subinfo = {
				uid: uid,
				cid: cid,
				pid: pid,
				ts: Date.now(),
				lng: lng,
				len: size,
				scr: 0,
				res: config.SAVING,
				cpu: 0,
				mem: 0 
			};

			dblink.judge.insert_submission(subinfo, function(sid){
				for( var i = 0 ; i < source_list.length ; i++ ){
					fs.writeFileSync( config.JUDGE_PATH + "submission/" + sid + "-" + i,  fs.readFileSync(req.files[i].path) );
					fs.unlinkSync(req.files[i].path);
				}
				
				dblink.judge.update_waiting_submission(sid, function(err){
					if( cid === "0" ){
						res.redirect("/submissions");
						return 0;
					}
					else {
						res.redirect("/submissions?cid=" + cid);
						return 0;
					}
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
		res.render('layout', {layout: 'detail', user: req.session, config: config, sid: sid, html_code: source_result });
	});
});

router.get('/source/:sid', function(req, res, next) {
	var sid = req.params.sid;
	dblink.submission.source_code(sid, req.session.uid, req.session["class"], function(source_code) {
		res.type('text/plain');
		res.send(source_code);
	});
});
router.get('/source/highlight/:sid', function(req, res, next) {
	var sid = req.params.sid;
	dblink.submission.source_code(sid, req.session.uid, req.session["class"], function(source_code) {
		res.render('layout', {layout: 'highlight', user: req.session, config: config, sid: sid, html_code: hl.highlight(source_code, hl.getLanguage('cpp')) });
	});
});


router.get('/score', function(req, res, next){
	var uid = req.session.uid;
	dblink.helper.isAdmin( uid, function(isAdmin){
	  dblink.user.info(req.session.uid, function(user) {
		if( isAdmin ){
			dblink.score.getAll( function(score){
				res.render('layout', {layout: 'score', user: req.session, score: score, userinfo: user});
			});	
		}
		else {
			dblink.score.getOne(uid, function(score){
				res.render('layout', {layout: 'score', user: req.session, score: score, userinfo: user});
			});
		}
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
