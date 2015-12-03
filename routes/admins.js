var express = require('express');
var router = express.Router();
var dblink = require('../lib/components/dblink');
var multer = require('multer');
var upload = multer({dest: 'files/'});
var fs = require('fs');

/* GET admin page dashboard */
router.get('/', function(req, res, next) {
	var uid = req.session.uid;
	dblink.helper.isAdmin(uid, function(isadmin) {
		if (isadmin) {
			res.render('admin/layout', { layout: 'dashboard', subtitle: 'Dashboard', user: req.session});
		} else {
			res.redirect('../login');
		}
	});
});
router.get('/announcement', function(req, res, next) {
	var uid = req.session.uid;
	dblink.helper.isAdmin(uid, function(isadmin) {
		if (!isadmin)
			return res.redirect('../login');
		dblink.admin.load_announcement(function(md_content) {
			res.render('admin/layout', { layout: 'announcement', subtitle: 'Edit Announcement', user: req.session, md_content: md_content});
		});
	});
});
router.get('/problems', function(req, res, next) {
	var uid = req.session.uid;
	dblink.helper.isAdmin(uid, function(isadmin) {
		if (!isadmin)
			return res.redirect('../login');
		dblink.admin.load_problemlist(function(prob_list) {
			res.render('admin/layout', { layout: 'problems', subtitle: 'Manage Problem List', user: req.session, prob_list: prob_list});
		});
	});
});
router.get('/contests', function(req, res, next) {
	var uid = req.session.uid;
	dblink.helper.isAdmin(uid, function(isadmin) {
		if (!isadmin)
			return res.redirect('../login');
		dblink.admin.load_contestlist(function(contest_list) {
			res.render('admin/layout', { layout: 'contests', subtitle: 'Manage Contest List', user: req.session, contest_list: contest_list});
		});
	});
});
router.get('/accounts', function(req, res, next) {
	var uid = req.session.uid;
	dblink.helper.isAdmin(uid, function(isadmin) {
		if (!isadmin)
			return res.redirect('../login');
		dblink.admin.load_accountlist(function(account_list) {
			res.render('admin/layout', { layout: 'accounts', subtitle: 'Manage Accounts', user: req.session, account_list: account_list});
		});
	});
});

router.get('/grade', function(req, res, next) {
	var uid = req.session.uid;
	dblink.helper.isAdmin(uid, function(isadmin) {
		if (!isadmin)
			return res.redirect('../login');
		dblink.admin.load_scores(function(score_list) {
			res.render('admin/layout', { layout: 'grade', subtitle: 'Manage Grades', user: req.session, score_list: score_list});
		});
	});
});
/* edit page */
router.get('/edit/problem/:pid', function(req, res, next) {
	var pid = req.params.pid,
		uid = req.session.uid;
	dblink.helper.isAdmin(uid, function(isadmin) {
		if (!isadmin)
			return res.redirect('../login');
		dblink.admin.load_problem_content(pid, function(prob_config) {
			dblink.admin.load_problem_solution(pid, function(sol_content) {
				prob_config.solution_md = sol_content;
				res.render('admin/layout', { layout: 'edit_problem', subtitle: 'Edit Problem', user: req.session, prob_config: prob_config, pid : pid});
			});
		});
	});
});
router.get('/edit/contest/:cid', function(req, res, next) {
	var cid = req.params.cid,
		uid = req.session.uid;
	dblink.helper.isAdmin(uid, function(isadmin) {
		if (!isadmin)
			return res.redirect('../login');
		dblink.admin.load_contest_config(cid, function(contest_config) {
			res.render('admin/layout', { layout: 'edit_contest', subtitle: 'Edit Contest', user: req.session, contest_config: contest_config, cid: cid});
		});
	});
});
router.get('/edit/gradettl/:eid', function(req, res, next) {
	var eid = req.params.eid,
		uid = req.session.uid;
	dblink.helper.isAdmin(uid, function(isadmin) {
		if (!isadmin)
			return res.redirect('../login');
		dblink.admin.load_gradettl(eid, function(econfig) {
			res.render('admin/layout', { layout: 'edit_gradettl', subtitle: 'Edit Grade Title', user: req.session, econfig: econfig});
		});
	});
});

/* create */
router.post('/new/problem', function(req, res, next) {
	var uid = req.session.uid;
	var config = {
		pid : req.body.pid,
		pub : req.body.pub,
		ttl : req.body.ttl,
		level : req.body.level,
		porder : req.body.porder,
		dependency: req.body.dependency.split(','),
		md : req.body.textbox
	};
	if (req.body.dependency.trim().length == 0)
		config.dependency = [];
	dblink.helper.isAdmin(uid, function(isadmin) {
		if (!isadmin)
			return res.redirect('../login');
		dblink.admin.create_problem_content(config, function() {
			res.redirect('/admin/problems');
		});
	});
});
router.post('/new/contest', function(req, res, next) {
	var uid = req.session.uid;
	var config = {
		cid : req.params.cid,
		pub : req.body.pub,
		ttl : req.body.ttl,
		ts1 : new Date(req.body.ts1).getTime(),
		ts2 : new Date(req.body.ts2).getTime(),
		pid : req.body.pid.split(','),
		participants: req.body.participants
	};
	if (req.body.pid.trim().length == 0)
		config.pid = [];
	dblink.helper.isAdmin(uid, function(isadmin) {
		if (!isadmin)
			return res.redirect('../login');
		dblink.admin.create_contest_config(config, function() {
			res.redirect('/admin/contests');
		});
	});
});
router.post('/new/account', function(req, res, next) {
	var uid = req.session.uid;
	var config = {
		lgn: req.body.lgn,
		pwd: req.body.pwd,
		class: req.body.class,
		email: req.body.email
	};
	console.log(config);
	dblink.helper.isAdmin(uid, function(isadmin) {
		if (!isadmin)
			return res.redirect('../login');
		dblink.admin.create_account(config, function() {
			res.redirect('/admin/accounts');
		});
	});
});
router.post('/new/grade', function(req, res, next) {
	var uid = req.session.uid;
	var ttl = req.body.ttl;
	dblink.helper.isAdmin(uid, function(isadmin) {
		if (!isadmin)
			return res.redirect('../login');
		dblink.admin.create_exam_scores(ttl, function() {
			res.redirect('/admin/grade');
		});
	});
});

/* update */
router.post('/update/announcement', function(req, res, next) {
	var uid = req.session.uid;
	var md = req.body.textbox;
	dblink.helper.isAdmin(uid, function(isadmin) {
		if (!isadmin)
			return res.redirect('../login');
		dblink.admin.update_announcement(md, function() {
			res.redirect('/');
		});
	});
});
router.post('/update/problem/:pid', function(req, res, next) {
	var uid = req.session.uid;
	var config = {
		pid : req.params.pid,
		pub : req.body.pub,
		ttl : req.body.ttl,
		level : req.body.level,
		porder : req.body.porder,
		dependency: req.body.dependency.split(','),
		md : req.body.textbox,
		solution_md: req.body.textbox2
	};
	if (req.body.dependency.trim().length == 0)
		config.dependency = [];
	dblink.helper.isAdmin(uid, function(isadmin) {
		if (!isadmin)
			return res.redirect('../login');
		dblink.admin.update_problem_content(config, function() {
			res.redirect('/problem/0/' + config.pid);
			dblink.admin.update_problem_solution(config, function() {

			});
		});
		
	});
});
router.post('/update/contest/:cid', function(req, res, next) {
	var uid = req.session.uid;
	var config = {
		cid : req.params.cid,
		pub : req.body.pub,
		ttl : req.body.ttl,
		ts1 : new Date(req.body.ts1).getTime(),
		ts2 : new Date(req.body.ts2).getTime(),
		pid : req.body.pid.split(','),
		refpid: req.body.refpid.split(','),
		participants: req.body.participants,
		rule: req.body.rule
	};
	if (req.body.pid.trim().length == 0)
		config.pid = [];
	if (req.body.refpid.trim().length == 0)
		config.refpid = [];

	dblink.helper.isAdmin(uid, function(isadmin) {
		if (!isadmin)
			return res.redirect('../login');
		dblink.admin.update_contest_config(config, function() {
			res.redirect('/contest/' + config.cid);
		});
	});
});
router.post('/update/account/:uid', function(req, res, next) {
	var uid = req.session.uid;
	var config = {
		uid : req.params.uid,
		pwd : req.body.pwd,
		class: req.body.class,
		email: req.body.email
	};
	dblink.helper.isAdmin(uid, function(isadmin) {
		if (!isadmin)
			return res.redirect('../login');
		dblink.admin.update_account(config, function() {
			res.redirect('/admin/accounts');
		});
	});
});
router.post('/update/grade/:uid', function(req, res, next) {
	var uid = req.session.uid;
	dblink.helper.isAdmin(uid, function(isadmin) {
		if (!isadmin)
			return res.redirect('../login');
		dblink.admin.update_scores(req.params.uid, req.body, function() {
			res.redirect('/admin/grade');
		});
	});
});
router.post('/update/gradettl/:eid', function(req, res, next) {
	var uid = req.session.uid;
	var eid = req.params.eid;
	dblink.helper.isAdmin(uid, function(isadmin) {
		if (!isadmin)
			return res.redirect('../login');
		dblink.admin.update_gradettl(eid, req.body.ttl, function() {
			res.redirect('/admin/grade');
		});
	});
});

/* api */
router.get('/api/rejudge?', function(req, res, next) {
	var uid = req.session.uid;
	dblink.helper.isAdmin(uid, function(isadmin) {
		if (!isadmin)
			return res.redirect('../login');
		dblink.api.rejudge(req.query, function(result) {
			if (req.headers.referer) res.redirect(req.headers.referer);
    		else res.redirect("/");
		});
	});
});
module.exports = router;
