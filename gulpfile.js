var gulp = require('gulp');

/*
	
 */

gulp.task('vendor', function() {
	return gulp.src([
		'bower_components/MathJax/**/*'
	]).pipe(gulp.dest('public/javascripts/MathJax'));
});

gulp.task('build', ['vendor']);
