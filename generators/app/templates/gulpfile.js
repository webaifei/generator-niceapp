/**
 * gulp 构建
 * 1. 开发环境下 livereload
 * 2. 生成线上文件
 * 3. 打包
 */
const gulp = require('gulp');
const gulpLoadPlugins = require('gulp-load-plugins');
const browserSync = require('browser-sync');
const del = require('del');


const $ = gulpLoadPlugins();
const reload = browserSync.reload;

gulp.task('styles', () => {
  return gulp.src('src/sass/*.scss')
    .pipe($.plumber())
    .pipe($.sourcemaps.init())
    .pipe($.sass.sync({
      outputStyle: 'expanded',
      precision: 10,
      includePaths: ['.']
    }).on('error', $.sass.logError))
    .pipe($.autoprefixer({browsers: ['> 1%', 'last 2 versions']}))
    .pipe($.sourcemaps.write())
    .pipe(gulp.dest('tmp/styles'))
    .pipe(reload({stream: true}));
});

gulp.task('scripts', () => {
  return gulp.src('src/scripts/**/*.js')
    .pipe($.plumber())
    // .pipe($.sourcemaps.init())
    // .pipe($.babel())
    // .pipe($.sourcemaps.write('.'))
    .pipe(gulp.dest('tmp/scripts'))
    .pipe(reload({stream: true}));
});

function lint(files, options) {
  return gulp.src(files)
    .pipe(reload({stream: true, once: true}))
    .pipe($.eslint(options))
    .pipe($.eslint.format())
    .pipe($.if(!browserSync.active, $.eslint.failAfterError()));
}

gulp.task('lint', () => {
  return lint('src/scripts/**/*.js', {
    fix: true
  }).pipe(gulp.dest('dist/scripts'));
});

// 合并资源 根据文件类型进行压缩优化 最后输出 包含html
gulp.task('html', ['styles', 'scripts'], () => {
  return gulp.src('src/*.html')
    .pipe($.useref({searchPath: ['tmp', 'src', 'dist']}))
    .pipe($.if('*.js', $.uglify()))
    .pipe($.if('*.css', $.cssnano({safe: true, autoprefixer: false})))
    .pipe($.if('*.html', $.htmlmin({collapseWhitespace: true})))
    .pipe(gulp.dest('dist'));
});
// 图片压缩暂时不用 效果不明显 直接使用tinypng实现
gulp.task('images', () => {
  return gulp.src('src/images/**/*')
    .pipe($.cache($.imagemin({
      progressive: true,
      interlaced: true,
      // don't remove IDs from SVGs, they are often used
      // as hooks for embedding and styling
      svgoPlugins: [{cleanupIDs: false}]
    })))
    .pipe(gulp.dest('dist/images'));
});

// gulp.task('fonts', () => {
//   return gulp.src(require('main-bower-files')('**/*.{eot,svg,ttf,woff,woff2}', function (err) {})
//     .concat('src/fonts/**/*'))
//     .pipe(gulp.dest('.tmp/fonts'))
//     .pipe(gulp.dest('dist/fonts'));
// });
// 拷贝所有非html文件到dist目录下
gulp.task('extras', () => {
  return gulp.src([
    'src/*.*',
    // '!src/*.html',
    '!.DS_Store'
  ], {
    dot: true
  }).pipe(gulp.dest('dist'));
});

gulp.task('clean', del.bind(null, ['dist', 'tmp']));
// 开发环境
// 1. css和js在dist中 修改了=>stream
// 2. images 和html在src中 修改=>reload
gulp.task('serve', ['styles', 'scripts'], () => {
  browserSync({
    notify: false,
    port: 9000,
    server: {
      baseDir: ['src', 'tmp']
    }
  });

  gulp.watch([
    'src/*.html',
    'src/images/**/*'
  ]).on('change', reload);

  gulp.watch('src/sass/**/*.scss', ['styles']);
  gulp.watch('src/scripts/**/*.js', ['scripts']);
});
// 启动production环境
gulp.task('serve:dist', () => {
  browserSync({
    notify: false,
    port: 9000,
    server: {
      baseDir: ['dist']
    }
  });
});

// 构建production包
gulp.task('build', ['html', 'images', 'extras'], () => {
  return gulp.src('dist/**/*').pipe($.size({title: 'build', gzip: true}));
});
// zip压缩包
gulp.task('zip',()=>{
  return gulp.src('dist/**/*')
    .pipe($.zip('bundle.zip'))
    .pipe(gulp.dest('./'))
})
// 默认任务是启动开发环境
gulp.task('default', ['clean'], () => {
  gulp.start('serve');
});
