var fs = require('fs'),
    path = require("path"),
    config = require('../../lib/config').config;
    message = require('../../lib/components/message');
var mkdirp = require("mkdirp");
var markdown = require('../../lib/components/plugin/markdown');

var connection = require('../../lib/mysql').connection;

function file_HTML(file_path) {
    fs.readFile(file_path, function(err, buf_data) {
        var data = markdown.post_marked(buf_data.toString());
        var file_name = path.basename(file_path, path.extname(file_path)) + '.html';
        var store_path = path.join(path.dirname(file_path), path.join('public', file_name));
        mkdirp(path.dirname(store_path), function (err) {
            if (err) return 0;
            fs.writeFile(store_path, data, function(err) {
                if (err) {
                    console.log(err);
                    return 0;
                }
                console.log('success : ' + file_path);
            });
        });
    });
}

function read_source(dir) {
    fs.readdir(dir, function(err, files) {
        if (err)    return 0;
        files.forEach(function(file) {
            file_full_path = path.join(dir, file);
            (function(file_full_path) {
                fs.stat(file_full_path, function(err, stats) {
                    if (err)    return 0;
                    if (stats.isDirectory())
                        read_source(file_full_path);
                    if (!stats.isDirectory())
                        file_HTML(file_full_path);
                });
            })(file_full_path);
        });
    });
}

read_source(config.JUDGE.path + 'source/md');