var mysql = require('mysql'),
	fs = require('fs'),
	path = require("path"),
	crypto = require('crypto');
	escape = require('escape-html'),
	config = require('../lib/const');

var submission = require('../lib/submission'),
	statistic = require('../lib/statistic'),
	archive = require('../lib/archive'),
	problem = require('../lib/problem'),
	contest = require('../lib/contest'),
	helper = require('../lib/helper'),
	judge = require('../lib/judge'),
	admin = require('../lib/admin'),
	rank = require('../lib/rank'),
	user = require('../lib/user'),
	api = require('../lib/api'),
	score = require('../lib/score');

var connection = mysql.createPool({  
    host     : config.DATABASE.host,  
    user     : config.DATABASE.user,  
    password : config.DATABASE.password,
    database : config.DATABASE.name,
	port     : config.DATABASE.port
});

module.exports = {
	submission: submission,
	statistic: statistic,
	archive: archive,
	problem: problem,
	contest: contest,
	helper: helper,
	judge: judge,
	admin: admin,
	rank: rank,
	user: user,
	api: api,
	score: score
};
