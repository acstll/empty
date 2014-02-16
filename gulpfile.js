var gulp = require('gulp');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var header = require('gulp-header');

var pkg = require('./package.json');
var banner = ['/**',
  ' * <%= pkg.name %> - <%= pkg.description %>',
  ' * @version v<%= pkg.version %>',
  ' * @link <%= pkg.repository.url %>',
  ' * @license <%= pkg.license %>',
  ' */',
  ''].join('\n');

gulp.task('uglify', function () {
  gulp.src('./index.js')
    .pipe(uglify())
    .pipe(rename(pkg.name + '.min.js'))
    .pipe(header(banner, { pkg : pkg } ))
    .pipe(gulp.dest('.'));
});

gulp.task('default', ['uglify']);
