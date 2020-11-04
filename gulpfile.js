
const BUNDLE_JS = true;
const BUNDLE_CSS = true;
const ES6 = true;

// Folders
// const BUILD = "build/";
// const COPY_FOLDERS = [
// 	"src/fonts/**/*.*",
// 	"src/vendor/**/*.*",
// ];



/**
 * 
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
const cachebust = require('gulp-cache-bust');
const purgecss = require('gulp-purgecss');
const gulpif = require('gulp-if');
const plumber = require('gulp-plumber');
const npmDist = require('gulp-npm-dist');
const chePartial = require('gulp-che-partial');
const MIX = require('./mix.config.json');

var src;




/**
 * 
 * Cleaning
 */
gulp.task('clean:build', function clean_build() {

	log(chalk.black.bgHex('#df274e').bold('Eliminado BUILD'));
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
 * 
 * Partials
 */
gulp.task('html:partials', function () {
	return gulp.src([MIX.src_folder + '/*.html'])
		.pipe(chePartial())
		.pipe(gulp.dest('build'));
});






/**
 * 
 * Copy
 */
gulp.task('copy:vendors', function () { // Copy files from node_modules to src/vendors
	return gulp.src(npmDist(), { base: './node_modules/' })
		.pipe(gulp.dest(MIX.src_folder + '/vendor'));
});

// gulp.task('copy:others', function copy_others(done) { //
// 	gulp.src(COPY_FOLDERS, {
// 		base: 'src'
// 	})
// 		.pipe(gulp.dest('./build/'));
// 	done();
// });

gulp.task('copy:data', function copy_data(done) {
	gulp.src([MIX.src_folder + '/**/*.html', MIX.src_folder + '/**/*.php', "!" + MIX.src_folder + '/partials/**/*'])
		.pipe(plumber({
			errorHandler: customErrorHandler
		}))
		.pipe(chePartial())
		.pipe(gulpif(MIX.minify_html, htmlmin({
			collapseWhitespace: true,
			removeComments: true,
			removeScriptTypeAttributes: true,
		})))
		.pipe(gulpif(MIX.cache_bust, cachebust({
			type: 'timestamp'
		})))

		.pipe(gulp.dest('./build/'));
	log(chalk.black.bgHex('#9cdf27').bold('✓ Compilado HTML/PHP'));
	done();
});

gulp.task('copy:img', gulp.series('clean:img', function copy_images(done) {
	gulp.src(MIX.assets_folder + '/img/**/*')
		.pipe(plumber({
			errorHandler: customErrorHandler
		}))
		.pipe(gulp.dest('build/img'));
	log(chalk.black.bgHex('#9cdf27').bold('✓ Copiado IMG'));
	done();
}));






/**
 * 
 * Manejo de errores
 */
function customErrorHandler(error) {
	log(chalk.white.bgRedBright.bold('Error en ' + error.plugin + ': ' + error.message));
	this.emit('end');
}








/**
 * 
 * 
 * Main Tasks
 */
gulp.task('css', function (done) {
	if (BUNDLE_CSS) {
		delete require.cache[require.resolve('./mix.config.json')] // Borramos el caché
		config = require('./mix.config.json');

		// Por cada elemento de JSON, creamos un bundle de CSS
		Object.keys(config.css_bundles).forEach(function build_css(name) {
			log(chalk.gray.bold('[CSS] Compilado ' + config.css_bundles[name]));
			return gulp.src(config.css_bundles[name])
				.pipe(concat(name + '.css'))
				.pipe(gulpif(MIX.minify_css, cleanCSS({ compatibility: 'ie8' })))
				.pipe(gulpif(MIX.purge_css, purgecss({
					content: [MIX.src_folder + '**/*.html', MIX.src_folder + '/**/*.php', MIX.assets_folder + '/js/*.js']
				})))
				.pipe(gulp.dest(MIX.build_folder + "/assets/css/"))
			// .pipe(bs.stream({match: "**/*.css"}));
		});
	} else {
		gulp.src('src/css/**/*', {
			base: 'src/css'
		}).pipe(gulp.dest(MIX.build_folder + '/assets/css'))
			// .pipe(bs.stream({match: "**/*.css"}));
			// .pipe(bs.stream({ match: MIX.build_folder + "**/*.css" }));
	}

	log(chalk.black.bgHex('#9cdf27').bold('✓ Compilado CSS!'));

	done();
});



// Tarea para compilar de JS
gulp.task('js', function (done) {

	if (BUNDLE_JS) {
		delete require.cache[require.resolve('./mix.config.json')] // Borramos el caché
		config = require('./mix.config.json');

		// Por cada elemento de JSON, creamos un bundle de JS
		Object.keys(config.js_bundles).forEach(function build_js(name) {
			log(chalk.gray.bold('[JS] Compilado ' + config.js_bundles[name] + ' => ') + chalk.bgWhite.black.bold(name + '.js'));
			return gulp.src(config.js_bundles[name], { allowEmpty: true })
				.pipe(concat(name + '.js'))
				.pipe(gulpif(MIX.minify_js, gulpif(ES6, terser(), uglify())))
				.pipe(gulp.dest(MIX.build_folder + '/assets/js/'))
				.pipe(bs.stream({ match: "**/*.js" }));
		});
	} else {
		gulp.src(MIX.assets_folder + '/js/**/*', {
			base: MIX.assets_folder + '/js'
		}).pipe(gulp.dest(MIX.build_folder + '/assets/js'))
			.pipe(bs.stream({ match: "**/*.js" }));
	}

	log(chalk.black.bgHex('#9cdf27').bold('✓ Compilado JS!'));

	done();
});




/**
 * SASS
 */
gulp.task('sass', gulp.series(function compile_sass(done) {
	gulp.src(MIX.assets_folder + "/css/style.scss")
		.pipe(sass({
			outputStyle: 'expanded',
		}).on('error', sass.logError))
		.pipe(gulpif(MIX.autoprefix_csss, autoprefixer()))
		// .pipe(cleanCSS({ compatibility: 'ie8' }))
		.pipe(gulp.dest(MIX.assets_folder + "/css"));
	// .pipe(bs.stream({match: "**/*.css"}));

	log(chalk.black.bgHex('#9cdf27').bold('✓ Compilado SASS!'));
	done();
}));




/**
 * 
 * Browser
 */
gulp.task('browser:init', function browser_init(done) {
	bs.init({
		baseDir: MIX.build_folder,
		proxy: MIX.url + MIX.build_folder,
		notify: false,
		injectChanges: true,
		open: MIX.autoopen ? 'local' : false,
		port: MIX.port,
	});
	done();
});

gulp.task('browser:stream', function browser_stream(done) {
	if (MIX.autoreload) {
		gulp.src(MIX.assets_folder + "/**/*.css")
			.pipe(bs.stream({ match: "**/*.css" }));
	}
	done();
});

gulp.task('browser:reload', function browser_reload(done) {
	if (MIX.autoreload) {
		bs.reload();
	}
	done();
});


/**
 * 
 * Development
 */
gulp.task('dev', gulp.series(['clean:build', 'copy:vendors', 'js', 'sass', 'css', 'copy:data', 'copy:img', 'browser:init'], function dev(done) {

	gulp.watch([MIX.assets_folder + '/**/*.scss'], gulp.series(['sass']));
	gulp.watch([MIX.assets_folder + '/**/*.css'], gulp.series(['css', 'browser:stream']));

	gulp.watch(MIX.assets_folder + "/js/*.js", gulp.series(['clean:js', 'js']));
	gulp.watch('config.json', gulp.series(['clean:js', 'js', 'sass']));

	gulp.watch([MIX.src_folder + '/**/*.php', MIX.src_folder + '/**/*.html'], gulp.series(['copy:data', 'browser:reload']));

	gulp.watch([MIX.assets_folder + '/img/**/*'], gulp.series(['copy:img', 'browser:reload']));
	// gulp.watch(COPY_FOLDERS, gulp.series(['copy:others']));

	done();
}));



/**
 * 
 * Build
 */

gulp.task('build', gulp.series(['clean:build', 'js', 'sass', 'css', 'copy:data', 'copy:img'], function (done) {
	done();
}));




/**
 * 
 * Zipear
 */
gulp.task('zip:build', function zip_build() {
	return gulp.src([MIX.build_folder + '/**'])
		.pipe(zip('build.zip'))
		.pipe(gulp.dest('./'))
});
gulp.task('zip:all', function zip_all() {
	return gulp.src([
		'./**/*',
		'!./node_modules/**',
		'!./node_modules/',
		'!*.zip',
	])
		.pipe(zip('src.zip'))
		.pipe(gulp.dest('./'))
});





/**
 * 
 * Default task
 */
gulp.task('default', gulp.series(['dev']));