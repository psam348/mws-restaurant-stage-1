var gulp = require('gulp');
// var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var browserSync = require('browser-sync');
var eslint = require('gulp-eslint');
// var jasmine = require('gulp-jasmine-phantom');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
let cleanCSS = require('gulp-clean-css');

gulp.task('scripts', function() {
	return gulp.src('js/**/*.js')
		.pipe(concat('all.js'))
        .pipe(gulp.dest('dist/js'));
});

gulp.task('sw', function() {
	return gulp.src('sw.js')
        .pipe(gulp.dest('dist'));
});

gulp.task('scripts-dist', function() {
	return gulp.src('js/**/*.js')
		.pipe(concat('all.js'))
		.pipe(uglify())
        .pipe(gulp.dest('dist/js'));
});

gulp.task('copy-html', function() {
	return gulp.src('./*.html')
        .pipe(gulp.dest('./dist'));
});

gulp.task('copy-images', function() {
	return gulp.src('img/*')
        .pipe(gulp.dest('dist/img'));
});

gulp.task('styles', function() {
	return gulp.src('css/*.css')
    .pipe(cleanCSS({compatibility: 'ie8'}))
    .pipe(gulp.dest('dist/css')); 
});

var reload = browserSync.reload;

// watch files for changes and reload
gulp.task('serve', function() {
  browserSync({
    server: {
      baseDir: 'dist'
    }
  });

  gulp.watch(['*.html', 'css/**/*.css', 'js/**/*.js'], {cwd: 'dist'}, reload);
});

// gulp.task('lint', function () {
// 	return gulp.src(['js/**/*.js'])
// 		// eslint() attaches the lint output to the eslint property
// 		// of the file object so it can be used by other modules.
// 		.pipe(eslint())
// 		// eslint.format() outputs the lint results to the console.
// 		// Alternatively use eslint.formatEach() (see Docs).
// 		.pipe(eslint.format())
// 		// To have the process exit with an error code (1) on
// 		// lint error, return the stream and pipe to failOnError last.
// 		.pipe(eslint.failOnError());
// });

// gulp.task('default', ['copy-html', 'copy-images', 'styles', 'scripts'], function() {
// 	gulp.watch('css/**/*.css', ['styles']);
// 	// gulp.watch('js/**/*.js', ['lint']);
// 	gulp.watch('/index.html', ['copy-html']);
// 	gulp.watch('./dist/index.html').on('change', browserSync.reload);

// 	browserSync.init({
// 		server: './dist'
// 	});
// });

// gulp.task('dist', [
// 	'copy-html',
// 	'copy-images',
// 	'styles',
// 	'scripts-dist'
// ]);