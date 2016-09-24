var submission = require('./submission'),
	statistic = require('./statistic'),
	archive = require('./archive'),
	problemManager = require('./ProblemManager'),
	contest = require('./contest'),
	helper = require('./helper'),
	judge = require('./judge'),
	admin = require('./admin'),
	rank = require('./rank'),
	user = require('./user'),
	api = require('./api'),
	score = require('./score');

module.exports = {
	submission: submission,
	statistic: statistic,
	archive: archive,
	contest: contest,
	helper: helper,
	judge: judge,
	admin: admin,
	rank: rank,
	user: user,
	api: api,
	score: score,
	problemManager: problemManager
};
