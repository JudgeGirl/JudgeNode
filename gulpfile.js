const { src, dest, series } = require('gulp');

function build() {
    return src('bower_components/MathJax/**/*')
        .pipe(dest('public/javascripts/MathJax'));
}

exports.build = build;
exports.default = series(build);
