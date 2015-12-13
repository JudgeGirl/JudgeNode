var exec = require('child_process').exec;


var autorun = function() {
	var child = exec('npm start');
	child.stdout.on('data', function(data) {
		// console.log(data);
	});
	child.stderr.on('data', function(data) {
		console.log(data);
	});
	child.on('close', function(code) {
		console.log('closing code: ' + code);
		autorun();
	});
};

autorun();