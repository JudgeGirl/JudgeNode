var express = require('express');
var path = require('path');
var router = express.Router();
var dblink = require('../lib/components/dblink');
var multer = require('multer');
var upload = multer({
    dest: 'files/'
});
var fs = require('fs');
var utils = require('../lib/components/utils');
var loginURL = utils.url_for('login');

/* GET admin page dashboard */
router.get('/', function(req, res, next) {
    var uid = req.session.uid;
    dblink.helper.isAdmin(uid, function(isadmin) {
        if (isadmin) {
            dblink.admin.load_dashboard(function(system_status) {
                res.render('admin/layout', {
                    layout: 'dashboard',
                    subtitle: 'Dashboard',
                    user: req.session,
                    system_status: system_status
                });
            });
        } else {
            res.redirect(loginURL);
        }
    });
});
router.get('/announcement', function(req, res, next) {
    var uid = req.session.uid;
    dblink.helper.isAdmin(uid, function(isadmin) {
        if (!isadmin)
            return res.redirect(loginURL);
        dblink.admin.load_announcement(function(md_content) {
            res.render('admin/layout', {
                layout: 'announcement',
                subtitle: 'Edit Announcement',
                user: req.session,
                md_content: md_content
            });
        });
    });
});
router.get('/problems', function(req, res, next) {
    var uid = req.session.uid;
    dblink.helper.isAdmin(uid, function(isadmin) {
        if (!isadmin)
            return res.redirect(loginURL);
        dblink.admin.load_problemlist(function(prob_list) {
            res.render('admin/layout', {
                layout: 'problems',
                subtitle: 'Manage Problem List',
                user: req.session,
                prob_list: prob_list
            });
        });
    });
});
router.get('/contests', function(req, res, next) {
    var uid = req.session.uid;
    dblink.helper.isAdmin(uid, function(isadmin) {
        if (!isadmin)
            return res.redirect(loginURL);
        dblink.admin.load_contestlist(function(contest_list) {
            res.render('admin/layout', {
                layout: 'contests',
                subtitle: 'Manage Contest List',
                user: req.session,
                contest_list: contest_list
            });
        });
    });
});
router.get('/accounts', function(req, res, next) {
    var uid = req.session.uid;
    dblink.helper.isAdmin(uid, function(isadmin) {
        if (!isadmin)
            return res.redirect(loginURL);
        dblink.admin.load_accountlist(function(account_list) {
            res.render('admin/layout', {
                layout: 'accounts',
                subtitle: 'Manage Accounts',
                user: req.session,
                account_list: account_list
            });
        });
    });
});

router.get('/grade', function(req, res, next) {
    var uid = req.session.uid;
    dblink.helper.isAdmin(uid, function(isadmin) {
        if (!isadmin)
            return res.redirect(loginURL);
        dblink.admin.load_scores(function(score_list) {
            res.render('admin/layout', {
                layout: 'grade',
                subtitle: 'Manage Grades',
                user: req.session,
                score_list: score_list
            });
        });
    });
});


/* api */
router.get('/api/rejudge?', function(req, res, next) {
    var uid = req.session.uid;
    dblink.helper.isAdmin(uid, function(isadmin) {
        if (!isadmin)
            return res.redirect(loginURL);
        dblink.api.rejudge(req.query, function(result) {
            if (req.headers.referer) res.redirect(req.headers.referer);
            else res.redirect(utils.url_for('/'));
        });
    });
});


var editRouter = require('./admin/edit'),
    updateRouter = require('./admin/update'),
    newRouter = require('./admin/new');

router.use('/edit', editRouter);
router.use('/new', newRouter);
router.use('/update', updateRouter);

module.exports = router;
