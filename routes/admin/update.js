var express = require('express');
var path = require('path');
var router = express.Router();
var dblink = require('../../lib/components/dblink');
var multer = require('multer');
var upload = multer({dest: 'files/'});
var fs = require('fs');
var loginURL = '/login';


/* update */
router.post('/announcement', function(req, res, next) {
	var uid = req.session.uid;
	var md = req.body.textbox;
	dblink.helper.isAdmin(uid, function(isadmin) {
		if (!isadmin)
			return res.redirect(loginURL);
		dblink.admin.update_announcement(md, function() {
			res.redirect('/');
		});
	});
});
router.post('/problem/:pid', function(req, res, next) {
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
			return res.redirect(loginURL);
		dblink.admin.update_problem_content(config, function() {
			res.redirect('/problem/0/' + config.pid);
			dblink.admin.update_problem_solution(config, function() {

			});
		});
		
	});
});
router.post('/contest/:cid', function(req, res, next) {
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
			return res.redirect(loginURL);
		dblink.admin.update_contest_config(config, function() {
			res.redirect('/contest/' + config.cid);
		});
	});
});
router.post('/account/:uid', function(req, res, next) {
	var uid = req.session.uid;
	var config = {
		uid : req.params.uid,
		pwd : req.body.pwd,
		class: req.body.class,
		email: req.body.email
	};
	dblink.helper.isAdmin(uid, function(isadmin) {
		if (!isadmin)
			return res.redirect(loginURL);
		dblink.admin.update_account(config, function() {
			res.redirect('/admin/accounts');
		});
	});
});
router.post('/grade/:uid', function(req, res, next) {
	var uid = req.session.uid;
	dblink.helper.isAdmin(uid, function(isadmin) {
		if (!isadmin)
			return res.redirect(loginURL);
		dblink.admin.update_scores(req.params.uid, req.body, function() {
			res.redirect('/admin/grade');
		});
	});
});
router.post('/gradettl/:eid', function(req, res, next) {
	var uid = req.session.uid;
	var eid = req.params.eid;
	dblink.helper.isAdmin(uid, function(isadmin) {
		if (!isadmin)
			return res.redirect(loginURL);
		dblink.admin.update_gradettl(eid, req.body.ttl, function() {
			res.redirect('/admin/grade');
		});
	});
});

module.exports = router;