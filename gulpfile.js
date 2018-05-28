var gulp = require('gulp');
var uglify =require('gulp-uglify');//压缩js
var rename = require('gulp-rename');
var less = require('gulp-less');
var concatCss = require('gulp-concat-css');// 合并css
var cleanCSS = require('gulp-clean-css');// 压缩css
var postcss = require('gulp-postcss');
var autoprefixer = require('autoprefixer');

gulp.task('css', function() {
    return gulp.src('./public/less/*.less')
        .pipe(less())
        .pipe(postcss([ autoprefixer({
                "browsers": ["last 2 version", "> 0.5%", "ie 6-8","Firefox < 20"]
                // "browsers": ["last 2 version", "> 0.1%"]
            })
        ]))
        .pipe(cleanCSS())//压缩
        .pipe(gulp.dest('./public/css'));
});

gulp.task('js',function(){
    return gulp.src('./public/js/*.js')
        .pipe(uglify())//压缩,不能压缩es6
        .pipe(rename({suffix: '.min'}))
        .pipe(gulp.dest('./public/dist/js'))
});

gulp.task("default", ['css','js']);
