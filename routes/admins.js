var express = require('express');
var router = express.Router();
var dblink = require('../lib/dblink');
var config = require('../lib/const');
var multer = require('multer');
var upload = multer({dest: 'files/'});
var fs = require('fs');

/* GET admin page dashboard */
router.get('/', function(req, res, next) {
	var uid = req.session.uid;
	dblink.helper.isAdmin(uid, function(isadmin) {
		if (isadmin) {
			res.render('admin/layout', { layout: 'dashboard', user: req.session, config: config});
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
			res.render('admin/layout', { layout: 'announcement', user: req.session, config: config, md_content: md_content});
		});
	});
});
router.get('/problems', function(req, res, next) {
	var uid = req.session.uid;
	dblink.helper.isAdmin(uid, function(isadmin) {
		if (!isadmin)
			return res.redirect('../login');
		dblink.admin.load_problemlist(function(prob_list) {
			res.render('admin/layout', { layout: 'problems', user: req.session, config: config, prob_list: prob_list});
		});
	});
});
router.get('/contests', function(req, res, next) {
	var uid = req.session.uid;
	dblink.helper.isAdmin(uid, function(isadmin) {
		if (!isadmin)
			return res.redirect('../login');
		dblink.admin.load_contestlist(function(contest_list) {
			res.render('admin/layout', { layout: 'contests', user: req.session, config: config, contest_list: contest_list});
		});
	});
});
router.get('/accounts', function(req, res, next) {
	var uid = req.session.uid;
	dblink.helper.isAdmin(uid, function(isadmin) {
		if (!isadmin)
			return res.redirect('../login');
		dblink.admin.load_accountlist(function(account_list) {
			res.render('admin/layout', { layout: 'accounts', user: req.session, config: config, account_list: account_list});
		});
	});
});

router.get('/grade', function(req, res, next) {
	var uid = req.session.uid;
	dblink.helper.isAdmin(uid, function(isadmin) {
		if (isadmin) {
			res.render('admin/layout', { layout: 'grade', user: req.session, config: config});
		} else {
			res.redirect('../login');
		}
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
			res.render('admin/layout', { layout: 'edit_problem', user: req.session, config: config, prob_config: prob_config, pid : pid});
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
			res.render('admin/layout', { layout: 'edit_contest', user: req.session, config: config, contest_config: contest_config, cid: cid});
		});
	});
});
/* new page */
router.get('/new/problem', function(req, res, next) {
	var uid = req.session.uid;
	dblink.helper.isAdmin(uid, function(isadmin) {
		if (!isadmin)
			return res.redirect('../login');
		res.render('admin/layout', { layout: 'new_problem', user: req.session, config: config});
	});
});
router.get('/new/contest', function(req, res, next) {
	var uid = req.session.uid;
	dblink.helper.isAdmin(uid, function(isadmin) {
		if (!isadmin)
			return res.redirect('../login');
		res.render('admin/layout', { layout: 'new_contest', user: req.session, config: config});
	});
});
router.get('/new/account', function(req, res, next) {
	var uid = req.session.uid;
	dblink.helper.isAdmin(uid, function(isadmin) {
		if (!isadmin)
			return res.redirect('../login');
		res.render('admin/layout', { layout: 'new_account', user: req.session, config: config});
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
			res.redirect('/');
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
			res.redirect('/');
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
			res.redirect('/');
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
		md : req.body.textbox
	};
	if (req.body.dependency.trim().length == 0)
		config.dependency = [];
	dblink.helper.isAdmin(uid, function(isadmin) {
		if (!isadmin)
			return res.redirect('../login');
		dblink.admin.update_problem_content(config, function() {
			res.redirect('/');
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
		participants: req.body.participants
	};
	if (req.body.pid.trim().length == 0)
		config.pid = [];
	dblink.helper.isAdmin(uid, function(isadmin) {
		if (!isadmin)
			return res.redirect('../login');
		dblink.admin.update_contest_config(config, function() {
			res.redirect('/');
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
			res.redirect('/');
		});
	});
});
module.exports = router;
