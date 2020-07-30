/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

require('../interface');

const
	{webpack, src} = require('config');

const
	fs = require('fs-extra-promise'),
	path = require('upath'),
	delay = require('delay');

const
	genHash = include('build/hash');

const
	{isURL, isFolder, files, folders} = include('src/super/i-static-page/modules/const'),
	{getScriptDecl, getStyleDecl, getLinkDecl} = include('src/super/i-static-page/modules/ss-helpers/tags'),
	{needInline} = include('src/super/i-static-page/modules/ss-helpers/helpers');

exports.loadLibs = loadLibs;

/**
 * Initializes the specified libraries and returns code to load
 *
 * @param {Libs} libs
 * @param {Object<string>=} [assets] - map with static page assets
 * @param {boolean=} [documentWrite] - if true,
 *   the function returns JS code to load the libraries by using document.write
 *
 * @returns {!Promise<string>}
 */
async function loadLibs(libs, {assets, documentWrite} = {}) {
	let
		res = '';

	for (const lib of await initLibs(libs, assets)) {
		lib.defer = lib.defer !== false;
		lib.documentWrite = documentWrite;
		res += await getScriptDecl(lib);
	}

	return res;
}

exports.loadStyles = loadStyles;

/**
 * Initializes the specified styles and returns code to load
 *
 * @param {StyleLibs} libs
 *
 * @param {Object<string>=} [assets] - map with static page assets
 * @param {boolean=} [documentWrite] - if true,
 *   the function returns JS code to load the libraries by using document.write
 *
 * @returns {!Promise<string>}
 */
async function loadStyles(libs, {assets, documentWrite} = {}) {
	let
		res = '';

	for (const lib of await initLibs(libs, assets)) {
		lib.defer = lib.defer !== false;
		lib.documentWrite = documentWrite;
		res += await getStyleDecl(lib);
		res += '\n';
	}

	return res;
}

exports.loadLinks = loadLinks;

/**
 * Initializes the specified links  and returns code to load
 *
 * @param {Links} libs
 * @param {Object<string>=} [assets] - map with static page assets
 * @param {boolean=} [documentWrite] - if true,
 *   the function returns JS code to load the links by using document.write
 *
 * @returns {!Promise<string>}
 */
async function loadLinks(libs, {assets, documentWrite} = {}) {
	let
		res = '';

	for (const lib of await initLibs(libs, assets)) {
		lib.documentWrite = documentWrite;
		res += await getLinkDecl(lib);
		res += '\n';
	}

	return res;
}

exports.initLibs = initLibs;

/**
 * Initializes the specified libraries.
 * The function returns a list of initialized libraries to load.
 *
 * @param {(Libs|StyleLibs)} libs
 * @param {Object<string>=} [assets] - map with static page assets
 * @returns {!Promise<!Array<(InitializedLib|InitializedStyleLib|InitializedLink)>>}
 */
async function initLibs(libs, assets) {
	const
		res = [];

	for (const [key, val] of libs.entries()) {
		const p = Object.isString(val) ? {src: val} : {...val};
		p.inline = needInline(p.inline);

		let
			cwd;

		if (!p.source || p.source === 'lib') {
			cwd = src.lib();

		} else if (p.source === 'src') {
			cwd = src.src();

		} else {
			cwd = src.clientOutput();
		}

		if (p.source === 'output') {
			if (assets) {
				p.src = assets[p.src];
			}

			p.src = path.join(cwd, Object.isObject(p.src) ? p.src.path : p.src);

			if (!p.inline) {
				p.src = path.relative(src.clientOutput(), p.src);
			}

		} else {
			p.src = resolveAsLib({name: key, relative: !p.inline}, cwd, p.src);
		}

		if (p.inline) {
			while (!fs.existsSync(p.src)) {
				await delay((1).second());
			}

		} else {
			p.src = webpack.publicPath(p.src);
		}

		res.push(p);
	}

	return res;
}

exports.resolveAsLib = resolveAsLib;

/**
 * Loads the specified file or directory as an external library to the output folder.
 * The function returns a path to the library from the output folder.
 *
 * @param {string=} [name] - name of the library
 *   (if not specified, the name will be taken from a basename of the source file)
 *
 * @param {boolean=} [relative=true] - if false, the function will return an absolute path
 * @param {...string} paths - string paths to join (also, can take URL-s)
 * @returns {string}
 *
 * @example
 * ```js
 * loadAsLib({name: 'jquery'}, 'node_modules', 'jquery/dist/jquery.min.js');
 * loadAsLib({name: 'images'}, 'assets', 'images/');
 * ```
 */
function resolveAsLib({name, relative = true} = {}, ...paths) {
	const
		url = paths.find((el) => isURL.test(el));

	if (url != null) {
		return url;
	}

	const
		resSrc = path.join(...paths),
		srcIsFolder = isFolder.test(resSrc);

	name = name ?
		name + path.extname(resSrc) :
		path.basename(resSrc);

	const
		needHash = Boolean(webpack.hashFunction()),
		cache = srcIsFolder ? folders : files;

	if (cache[name]) {
		return cache[name];
	}

	const
		libDest = src.clientOutput(webpack.output({name: 'lib'}));

	let
		fileContent,
		newSrc;

	if (srcIsFolder) {
		const hash = needHash ? `${genHash(path.join(resSrc, '/**/*'))}_` : '';
		newSrc = path.join(libDest, hash + name);

	} else {
		fileContent = fs.readFileSync(resSrc);
		const hash = needHash ? `${genHash(fileContent)}_` : '';
		newSrc = path.join(libDest, hash + name);
	}

	const
		distPath = relative ? path.relative(src.clientOutput(), newSrc) : newSrc;

	if (!fs.existsSync(newSrc)) {
		if (srcIsFolder) {
			fs.mkdirpSync(newSrc);
			fs.copySync(resSrc, newSrc);

		} else {
			const
				clrfx = /\/\/# sourceMappingURL=.*/;

			fs.mkdirpSync(libDest);
			fs.writeFileSync(newSrc, fileContent.toString().replace(clrfx, ''));
		}
	}

	cache[name] = distPath;
	return distPath;
}