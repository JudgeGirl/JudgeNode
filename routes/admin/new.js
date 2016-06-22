var express = require('express');
var path = require('path');
var router = express.Router();
var dblink = require('../../lib/components/dblink');
var multer = require('multer');
var upload = multer({
    dest: 'files/'
});
var fs = require('fs');
var utils = require('../../lib/components/utils');
var loginURL = utils.url_for('login');

/* new page */
router.get('/problem', function(req, res, next) {
    var uid = req.session.uid;
    dblink.helper.isAdmin(uid, function(isadmin) {
        if (!isadmin)
            return res.redirect(loginURL);
        res.render('admin/layout', {
            layout: 'new_problem',
            subtitle: 'Add New Problem',
            user: req.session
        });
    });
});
router.get('/contest', function(req, res, next) {
    var uid = req.session.uid;
    dblink.helper.isAdmin(uid, function(isadmin) {
        if (!isadmin)
            return res.redirect(loginURL);
        res.render('admin/layout', {
            layout: 'new_contest',
            subtitle: 'Add New Contest',
            user: req.session
        });
    });
});
router.get('/account', function(req, res, next) {
    var uid = req.session.uid;
    dblink.helper.isAdmin(uid, function(isadmin) {
        if (!isadmin)
            return res.redirect(loginURL);
        res.render('admin/layout', {
            layout: 'new_account',
            subtitle: 'Add New Account',
            user: req.session
        });
    });
});
router.get('/grade', function(req, res, next) {
    var uid = req.session.uid;
    dblink.helper.isAdmin(uid, function(isadmin) {
        if (!isadmin)
            return res.redirect(loginURL);
        res.render('admin/layout', {
            layout: 'new_grade',
            subtitle: 'Add Grade',
            user: req.session
        });
    });
});

/* create */
router.post('/problem', function(req, res, next) {
    var uid = req.session.uid;
    var config = {
        pid: req.body.pid,
        pub: req.body.pub,
        ttl: req.body.ttl,
        level: req.body.level,
        porder: req.body.porder,
        dependency: req.body.dependency.split(','),
        md: req.body.textbox
    };
    if (req.body.dependency.trim().length == 0)
        config.dependency = [];
    dblink.helper.isAdmin(uid, function(isadmin) {
        if (!isadmin)
            return res.redirect(loginURL);
        dblink.admin.create_problem_content(config, function() {
            res.redirect(utils.url_for('admin/problems'));
        });
    });
});
router.post('/contest', function(req, res, next) {
    var uid = req.session.uid;
    var config = {
        cid: req.params.cid,
        pub: req.body.pub,
        ttl: req.body.ttl,
        ts1: new Date(req.body.ts1).getTime(),
        ts2: new Date(req.body.ts2).getTime(),
        pid: req.body.pid.split(','),
        participants: req.body.participants
    };
    if (req.body.pid.trim().length == 0)
        config.pid = [];
    dblink.helper.isAdmin(uid, function(isadmin) {
        if (!isadmin)
            return res.redirect(loginURL);
        dblink.admin.create_contest_config(config, function() {
            res.redirect(utils.url_for('admin/contests'));
        });
    });
});
router.post('/account', function(req, res, next) {
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
            return res.redirect(loginURL);
        dblink.admin.create_account(config, function() {
            res.redirect(utils.url_for('admin/accounts'));
        });
    });
});
router.post('/grade', function(req, res, next) {
    var uid = req.session.uid;
    var ttl = req.body.ttl;
    dblink.helper.isAdmin(uid, function(isadmin) {
        if (!isadmin)
            return res.redirect(loginURL);
        dblink.admin.create_exam_scores(ttl, function() {
            res.redirect(utils.url_for('admin/grade'));
        });
    });
});

module.exports = router;
