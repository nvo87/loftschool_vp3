"use strict" //показывать место ошибки в терминале

var gulp = require('gulp'),							//создание переменных для вызова 
	wiredep = require('wiredep').stream,
	useref = require('gulp-useref'),				//склеивает и рассовывает все по папкам, в html надо поставить специальные комментарии для css и js
	uglify = require('gulp-uglify'),
	clean = require('gulp-clean'),
	gulpif = require('gulp-if'),
	filter = require('gulp-filter'),
	size = require('gulp-size'),
	imagemin = require('gulp-imagemin'),
	minifyCss = require('gulp-minify-css'), 		//минификация файла css
	jade = require('gulp-jade'),
	prettify = require('gulp-prettify'),
	browserSync = require('browser-sync'),
	reload = browserSync.reload;

///////////
//сборка //
///////////

//очистка папки
	gulp.task('clean', function () {
		return gulp.src('dist')
			.pipe(clean());
	});

//переносим html, css, js в папку dist
	gulp.task('useref', function () {
		var assets = useref.assets();
		return gulp.src('app/*.html')
			.pipe(assets)
			.pipe(gulpif('*.js', uglify()))
			.pipe(gulpif('*.css', minifyCss({compability: 'ie8'})))
			.pipe(assets.restore())
			.pipe(useref())
			.pipe(gulp.dest('dist')); //прописываем новые пути
	});

//перенос шрифтов
	gulp.task('fonts', function(){
		gulp.src('app/fonts/*')
			.pipe(filter(['*.eot', '*.svg', '*.ttf', '*.woff', '*.woff2']))
			.pipe(gulp.dest('dist/fonts/'));
	});

//картинки
	gulp.task('images', function () {
		return gulp.src('app/img/**/*')
			.pipe(imagemin({
				progressive: true,
				interlaced:true
			}))
			.pipe(gulp.dest('dist/img'));
	});


//остальные файлы, такие как favicon  и пр.
	gulp.task('extras', function () {
		return gulp.src([
			'app/*.*',
			'!app/*.html'
		]).pipe(gulp.dest('dist'));
	});

//сборка и вывод размера содержимого папки dist
	gulp.task('dist', ['useref', 'images', 'fonts', 'extras'], function(){
		return gulp.src('dist/**/*').pipe(size({title:'build'}));
	});


/////////////////
//Работа с APP //
/////////////////

	// Собираем папку DIST (только после компиляции Jade)
	gulp.task('build', ['clean', 'jade'], function () {
	  gulp.start('dist');
	});

	// Компилируем Jade в html
	gulp.task('jade', function() {
	  gulp.src('app/templates/pages/*.jade')
	    .pipe(jade())
	    .on('error', log)
	    .pipe(prettify({indent_size: 2}))
	    .pipe(gulp.dest('app/'))
	    .pipe(reload({stream: true}));
	});

	// Подключаем ссылки на bower components
	gulp.task('wiredep', function () {
	  gulp.src('app/*.html')
	    .pipe(wiredep())
	    .pipe(gulp.dest('app/'))
	});

	// bower components если пользоваться jade
/*	gulp.task('wiredep', function () {
	  gulp.src('app/templates/common/*.jade')
	    .pipe(wiredep({
	      ignorePath: /^(\.\.\/)*\.\./
	    }))
	    .pipe(gulp.dest('app/templates/common/'))
	});*/

	// Запускаем локальный сервер (только после компиляции jade)
	gulp.task('server', function () {  
	  browserSync({
	    notify: false,
	    port: 9000,
	    server: {
	      baseDir: 'app'
	    }
	  });  
	});

	// слежка и запуск задач 
	gulp.task('watch', function () {
//	  gulp.watch('app/templates/**/*.jade', ['jade']);
	  gulp.watch('bower.json', ['wiredep']);
	  gulp.watch([
	  	'app/*.html',
	    'app/js/**/*.js',
	    'app/css/**/*.css'
	  ]).on('change', reload);
	});

	// Задача по-умолчанию 
	gulp.task('default', ['server', 'watch', 'wiredep']);

	// ====================================================
	// ====================================================
	// ===================== Функции ======================

	// Более наглядный вывод ошибок
	var log = function (error) {
	  console.log([
	    '',
	    "----------ERROR MESSAGE START----------",
	    ("[" + error.name + " in " + error.plugin + "]"),
	    error.message,
	    "----------ERROR MESSAGE END----------",
	    ''
	  ].join('\n'));
	  this.end();
	}


// ====================================================
// ====================================================
// =============== Важные моменты  ====================
// gulp.task(name, deps, fn) 
// deps - массив задач, которые будут выполнены ДО запуска задачи name
// внимательно следите за порядком выполнения задач!


