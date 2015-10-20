var moment = require('moment');
var fs = require('fs');
var yaml = require('js-yaml');
var _config = yaml.safeLoad(fs.readFileSync('../_config.yml', 'utf8'));
console.log(_config);
module.exports = {
	WT: 0, CE: 1, OLE: 2, MLE: 3, RE: 4, TLE: 5, WA: 6, AC: 7, SAVING: 8, PE: -1,
	CONTEST_SUBMIT_LIMIT: _config.CONTEST.SUBMIT_LIMIT,
	CONTEST_MODE: _config.CONTEST.MODE,
	res:  ['Waiting', 'Compilation Error', 'Output Limit Exceeded', 'Memory Limit Exceeded', 'Runtime Error', 'Time Limit Exceeded', 'Wrong Answer', 'Accepted', 'Uploading...', 'Presentation Error'],
	lng: ['*', 'C'], //, 'C++', 'C# 3.0', 'Python 3', 'Scala 2'],
	COMIPLER_ARGU: ['none', 'gcc -std=c99 -O2'], //, 'g++ -std=c++98 -O2', 'mcs -langversion:3', 'python3', 'scalac -optimise'],
	JUDGE_PATH: _config.JUDGE_PATH,
	DATABASE: {
		name: _config.DATABASE.dbname,
		host: _config.DATABASE.host,
		user: _config.DATABASE.user,
		password: _config.DATABASE.password,
		port: _config.DATABASE.port
	},
	HOST: {
		IP: _config.HOST.IP
	},
	DISQUS: {
		shortname: _config.Disqus.shortname
	},
	unitConvert: function(kind, bytes) {
		if (kind == 'mem') {
			var sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
   			if (bytes == 0) return '0 B';
   			var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
   			return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
		} else if (kind == 'cpu') {
			var sizes = ['ms', 's', 'ks', 'ms', 'ts'];
   			if (bytes == 0) return '0 ms';
   			var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
   			return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
		} else if (kind == 'date') {
			var utc = bytes.getTime() + bytes.getTimezoneOffset() * 60000;
			var utc8 = bytes;
			return moment(utc8).format('YYYY/MM/DD HH:mm:ss');
			return utc8.toLocaleString().replace(/T/, ' ').replace(/\..+/, '');
		}
		return 'unit undefined'
	}
};

