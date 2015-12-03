var fs = require('fs');
var yaml = require('js-yaml');
var path = require('path');
var _config = yaml.safeLoad(fs.readFileSync(path.join(__dirname, '../_config.yml'), 'utf8'));

exports.config = _config;
