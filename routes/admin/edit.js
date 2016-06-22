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

/* edit page */
router.get('/problem/:pid', function(req, res, next) {
    var pid = req.params.pid,
        uid = req.session.uid;
    dblink.helper.isAdmin(uid, function(isadmin) {
        if (!isadmin)
            return res.redirect(loginURL);
        dblink.admin.load_problem_content(pid, function(prob_config) {
            dblink.admin.load_problem_solution(pid, function(sol_content) {
                prob_config.solution_md = sol_content;
                res.render('admin/layout', {
                    layout: 'edit_problem',
                    subtitle: 'Edit Problem',
                    user: req.session,
                    prob_config: prob_config,
                    pid: pid
                });
            });
        });
    });
});
router.get('/contest/:cid', function(req, res, next) {
    var cid = req.params.cid,
        uid = req.session.uid;
    dblink.helper.isAdmin(uid, function(isadmin) {
        if (!isadmin)
            return res.redirect(loginURL);
        dblink.admin.load_contest_config(cid, function(contest_config) {
            res.render('admin/layout', {
                layout: 'edit_contest',
                subtitle: 'Edit Contest',
                user: req.session,
                contest_config: contest_config,
                cid: cid
            });
        });
    });
});
router.get('/gradettl/:eid', function(req, res, next) {
    var eid = req.params.eid,
        uid = req.session.uid;
    dblink.helper.isAdmin(uid, function(isadmin) {
        if (!isadmin)
            return res.redirect(loginURL);
        dblink.admin.load_gradettl(eid, function(econfig) {
            res.render('admin/layout', {
                layout: 'edit_gradettl',
                subtitle: 'Edit Grade Title',
                user: req.session,
                econfig: econfig
            });
        });
    });
});

module.exports = router;
