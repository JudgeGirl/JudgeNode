var moment = require('moment');
var unitConvert = function(kind, bytes) {
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
	return 'unit undefined';
}

module.exports = {
	unitConvert: unitConvert,
	url_for: require('./plugin/helper/url_for')
};