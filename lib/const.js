var moment = require('moment');

module.exports = {
	WT: 0,
	CE: 1,
	OLE: 2,
	MLE: 3,
	RE: 4,
	TLE: 5,
	WA: 6,
	AC: 7,
	SAVING: 8,
	CONTEST_SUBMIT_LIMIT: 15,
	CONTEST_MODE: false, 	// limits user open previous source code & submit problem which not in contest.
	res:  ['Waiting', 'Compilation Error', 'Output Limit Exceeded', 'Memory Limit Exceeded', 'Runtime Error', 'Time Limit Exceeded', 'Wrong Answer', 'Accepted', 'Uploading...'],
	lng: ['*', 'C'], //, 'C++', 'C# 3.0', 'Python 3', 'Scala 2'],
	COMIPLER_ARGU: ['none', 'gcc -std=c99 -O2'], //, 'g++ -std=c++98 -O2', 'mcs -langversion:3', 'python3', 'scalac -optimise'],
	JUDGE_PATH: '/home/c2014/judgesister/',
	// JUDGE_PATH: 'test_submission/',
	DATABASE: {
		name: 'c2015',
		host: '140.112.xxx.xxx',
		user: 'c2015',
		password: 'xxxxxxxxxxx',
		port: '3306'
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
