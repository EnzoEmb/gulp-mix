/**
 * Setup
 */
const PATH = "http://gulp-mix.test/";
const PORT = 3000;
const AUTORELOAD = true;
const AUTOOPEN = false;

// Files
const MINIFY_HTML = false;
const MINIFY_CSS = false;
const MINIFY_JS = false;
const PURGE_CSS = false;
const CACHE_BUST = false;
const AUTOPREFIX_CSS = true;
const PARTIALS_HTML = true;
const BUNDLE_JS = true;
const BUNDLE_CSS = true;
const ES6 = true;

// Folders
const BUILD = "build/";
const COPY_FOLDERS = [
	"src/fonts/**/*.*",
	"src/vendor/**/*.*",
];



/**
 * Dependencias
 */
const gulp = require('gulp');
const del = require('del');
const bs = require('browser-sync').create();
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const terser = require('gulp-terser');
const cleanCSS = require('gulp-clean-css');
const zip = require('gulp-zip');
const log = require('fancy-log');
const chalk = require('chalk');
const htmlmin = require('gulp-htmlmin');
// const imagemin = require('gulp-imagemin');
const cachebust = require('gulp-cache-bust');
const purgecss = require('gulp-purgecss');
const gulpif = require('gulp-if');
// const fileinclude = require('gulp-file-include');
const plumber = require('gulp-plumber');
const npmDist = require('gulp-npm-dist');
// const htmlPartial = require('gulp-html-partial');
// const chePartial = require('../')
const chePartial = require('./che-partials');

var src;


gulp.task('html:partials', function () {
	return gulp.src(['src/*.html'])
		.pipe(chePartial())
		.pipe(gulp.dest('build'));
});

gulp.task('copy:vendors', function () {
	return gulp.src(npmDist(), { base: './node_modules/' })
		.pipe(gulp.dest('./src/vendor'));
});


/**
 * Manejo de errores
 */
function customErrorHandler(error) {
	log(chalk.white.bgRedBright.bold('Error en ' + error.plugin + ': ' + error.message));
	this.emit('end');
}



/**
 * Cleaning
 */
gulp.task('clean:build', function clean_build() {

	log(chalk.white.bgRedBright.bold('Eliminado BUILD'));
	return del([
		'build/',
	]);
});

gulp.task('clean:js', function clean_js() {
	return del([
		'build/js',
	]);
});

gulp.task('clean:img', function clean_img() {
	return del([
		'build/img',
	]);
});



/**
 * Tasks
 */
gulp.task('css', function (done) {
	if (BUNDLE_CSS) {
		delete require.cache[require.resolve('./config.json')] // Borramos el caché
		config = require('./config.json');

		// Por cada elemento de JSON, creamos un bundle de CSS
		Object.keys(config.css).forEach(function build_css(name) {
			log(chalk.gray.bold('[CSS] Compilado ' + config.css[name]));
			return gulp.src(config.css[name])
				.pipe(concat(name + '.css'))
				.pipe(gulpif(MINIFY_CSS, cleanCSS({ compatibility: 'ie8' })))
				.pipe(gulpif(PURGE_CSS, purgecss({
					content: ['src/**/*.html', 'src/**/*.php', 'src/js/*.js']
				})))
				.pipe(gulp.dest("./build/css/"))
			// .pipe(bs.stream({match: "**/*.css"}));
		});
	} else {
		gulp.src('src/css/**/*', {
			base: 'src/css'
		}).pipe(gulp.dest('./build/css'))
		// .pipe(bs.stream({match: "**/*.css"}));
	}

	log(chalk.white.bgHex('#48a54b').bold('✓ Compilado CSS!'));

	done();
});



// Tarea para compilar de JS
gulp.task('js', function (done) {

	if (BUNDLE_JS) {
		delete require.cache[require.resolve('./config.json')] // Borramos el caché
		config = require('./config.json');

		// Por cada elemento de JSON, creamos un bundle de JS
		Object.keys(config.js).forEach(function build_js(name) {
			log(chalk.gray.bold('[JS] Compilado ' + config.js[name] + ' => ') + chalk.bgWhite.black.bold(name + '.js'));
			return gulp.src(config.js[name], { allowEmpty: true })
				.pipe(concat(name + '.js'))
				.pipe(gulpif(MINIFY_JS, gulpif(ES6, terser(), uglify())))
				.pipe(gulp.dest('./build/js/'))
				.pipe(bs.stream({ match: "**/*.js" }));
		});
	} else {
		gulp.src('src/js/**/*', {
			base: 'src/js'
		}).pipe(gulp.dest('./build/js'))
			.pipe(bs.stream({ match: "**/*.js" }));
	}

	log(chalk.white.bgHex('#48a54b').bold('✓ Compilado JS!'));

	done();
});



/**
 * Copia de assets al build
 */
gulp.task('copy:others', function copy_others(done) {
	gulp.src(COPY_FOLDERS, {
		base: 'src'
	})
		.pipe(gulp.dest('./build/'));
	done();
});

gulp.task('copy:data', function copy_data(done) {
	gulp.src(['src/**/*.html', 'src/**/*.php', '!src/partials/**/*'])
		.pipe(plumber({
			errorHandler: customErrorHandler
		}))
		.pipe(chePartial())
		.pipe(gulpif(MINIFY_HTML, htmlmin({
			collapseWhitespace: true,
			removeComments: true,
			removeScriptTypeAttributes: true,
		})))
		.pipe(gulpif(CACHE_BUST, cachebust({
			type: 'timestamp'
		})))

		.pipe(gulp.dest('./build/'));
	log(chalk.white.bgHex('#48a54b').bold('✓ Compilado HTML/PHP'));
	done();
});

gulp.task('copy:img', gulp.series('clean:img', function copy_images(done) {
	gulp.src('src/img/**/*')
		.pipe(plumber({
			errorHandler: customErrorHandler
		}))
		// .pipe(imagemin([
		// 	imagemin.gifsicle({ interlaced: true }),
		// 	imagemin.jpegtran({ progressive: true }),
		// 	imagemin.optipng({ optimizationLevel: 7 }),
		// 	imagemin.svgo({
		// 		plugins: [
		// 			{ removeViewBox: true },
		// 			{ cleanupIDs: false }
		// 		]
		// 	})
		// ]))
		.pipe(gulp.dest('build/img'));
	log(chalk.white.bgHex('#48a54b').bold('✓ Copiado IMG'));
	done();
}));


/**
 * SASS
 */
gulp.task('sass', gulp.series(function compile_sass(done) {
	gulp.src("./src/css/style.scss")
		.pipe(sass({
			outputStyle: 'expanded',
		}).on('error', sass.logError))
		.pipe(gulpif(AUTOPREFIX_CSS, autoprefixer()))
		// .pipe(cleanCSS({ compatibility: 'ie8' }))
		.pipe(gulp.dest("./src/css"));
	// .pipe(bs.stream({match: "**/*.css"}));

	log(chalk.white.bgHex('#48a54b').bold('✓ Compilado SASS!'));
	done();
}));



gulp.task('browser:init', function browser_init(done) {
	bs.init({
		baseDir: 'build/',
		proxy: PATH,
		notify: false,
		injectChanges: true,
		open: AUTOOPEN ? 'local' : false,
		port: PORT,
	});
	done();
});



gulp.task('browser:stream', function browser_stream(done) {
	if (AUTORELOAD) {
		gulp.src("./src/css/*.css")
			.pipe(bs.stream({ match: "**/*.css" }));
	}
	done();
});

gulp.task('browser:reload', function browser_reload(done) {
	if (AUTORELOAD) {
		bs.reload();
	}
	done();
});


/**
 * Development
 */
gulp.task('dev', gulp.series(['clean:build', 'copy:vendors', 'js', 'sass', 'css', 'copy:data', 'copy:img', 'copy:others', 'browser:init'], function dev(done) {

	gulp.watch(['src/**/*.scss'], gulp.series(['sass']));
	gulp.watch(['src/**/*.css'], gulp.series(['css', 'browser:stream']));

	gulp.watch("src/js/*.js", gulp.series(['clean:js', 'js']));
	gulp.watch('config.json', gulp.series(['clean:js', 'js', 'sass']));

	gulp.watch(['src/**/*.php', 'src/**/*.html'], gulp.series(['copy:data', 'browser:reload']));

	gulp.watch(['src/img/**/*'], gulp.series(['copy:img', 'browser:reload']));
	gulp.watch(COPY_FOLDERS, gulp.series(['copy:others']));

	done();
}));



/**
 * Build
 */

gulp.task('build', gulp.series(['clean:build', 'js', 'sass', 'css', 'copy:data', 'copy:img', 'copy:others'], function (done) {
	done();
}));




/**
 * Zipear
 */
gulp.task('zip:build', function zip_build() {
	return gulp.src(['./build/**'])
		.pipe(zip('build.zip'))
		.pipe(gulp.dest('./'))
});
gulp.task('zip:all', function zip_all() {
	return gulp.src([
		'!./node_modules/**',
		'!./node_modules/',
	])
		.pipe(zip('src.zip'))
		.pipe(gulp.dest('./'))
});



gulp.task('default', gulp.series(['dev']));