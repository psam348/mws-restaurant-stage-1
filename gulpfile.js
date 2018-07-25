var gulp = require('gulp');
var babel = require('gulp-babel');
// var sass = require('gulp-sass');
// var autoprefixer = require('gulp-autoprefixer');
var browserSync = require('browser-sync');
// var eslint = require('gulp-eslint');
// var jasmine = require('gulp-jasmine-phantom');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
let cleanCSS = require('gulp-clean-css');
var htmlmin = require('gulp-htmlmin');
// const imagemin = require('gulp-imagemin');
const webp = require('gulp-webp');
// var browserify = require('gulp-browserify');

gulp.task('scripts', function() {
	return gulp.src('js/**/*.js')
        // .pipe(babel())    
        .pipe(concat('all.js'))    
        .pipe(gulp.dest('dist/js'));
});

gulp.task('sw', function() {
    return gulp.src('sw.js')
        .pipe(gulp.dest('dist'));
});

gulp.task('scripts-dist', function() {
	return gulp.src('js/**/*.js')
        .pipe(babel({
            presets:['env']}))     
        .pipe(concat('all.js'))
		.pipe(uglify())
        .pipe(gulp.dest('dist/js'));
});

gulp.task('copy-html', function() {
    return gulp.src('./*.html')
        .pipe(htmlmin({collapseWhitespace: true}))
        .pipe(gulp.dest('./dist'));
});

gulp.task('copy-images', function() {
    return gulp.src('img/*.jpg')
        .pipe(webp())
        .pipe(gulp.dest('dist/img'));
});

gulp.task('styles', function() {
	return gulp.src('css/*.css')
    .pipe(cleanCSS({compatibility: 'ie8'}))
    .pipe(gulp.dest('dist/css')); 
});

gulp.task('distri', gulp.series([
	'copy-html',
	'copy-images',
	'styles',
    'scripts',
    'sw'
]));

gulp.task('fordist', gulp.series([
	'copy-html',
	'copy-images',
	'styles',
    'scripts-dist',
    'sw'
]));

const server = browserSync.create();

function reload(done) {
    server.reload();
    done();
  }
  
function serve(done) {
    server.init({
      server: {
        baseDir: 'dist'
      }
    });
    done();
  }
const watch = () => gulp.watch(['*.html', '*.js', 'css/**/*.css', 'js/**/*.js'], gulp.series('distri',reload));

gulp.task('serve', gulp.series('distri',serve, watch));

gulp.task('server',serve);

gulp.task('default',gulp.series('fordist','server'));

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

