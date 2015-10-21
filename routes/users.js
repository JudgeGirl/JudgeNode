var express = require('express');
var router = express.Router();
var dblink = require('../lib/dblink');
var config = require('../lib/const');
var multer = require('multer');
var upload = multer({dest: 'files/'});
var fs = require('fs');

/* GET users page */
router.get('/', function(req, res, next) {
	var uid = req.session.uid;
	dblink.user.info(uid, function(user) {
		res.render('layout', { layout: 'user', subtitle: 'User', user: req.session, userinfo: user});
	});
});
router.get('/:uid', function(req, res, next) {
	var uid = req.params.uid;
	dblink.user.info(uid, function(user) {
		res.render('layout', { layout: 'user', subtitle: 'User', user: req.session, userinfo: user});
	});
});

module.exports = router;
