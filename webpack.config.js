'use strict';

/*!
 * V4Fire Client Core
 * https://github.com/V4Fire/Client
 *
 * Released under the MIT license
 * https://github.com/V4Fire/Client/blob/master/LICENSE
 */

require('config');

const
	$C = require('collection.js'),
	EventEmitter = require('eventemitter2').EventEmitter2,
	config = require('config');

async function buildFactory(entry, buildId = '00') {
	const
		plugins = await include('build/plugins.webpack')({buildId});

	return {
		entry,
		output: await include('build/output.webpack'),
		resolve: await include('build/resolve.webpack'),
		resolveLoader: await include('build/resolve-loader.webpack'),
		externals: await include('build/externals.webpack'),
		module: await include('build/module.webpack')({buildId, plugins}),
		plugins,
		mode: isProd ? 'production' : 'development',
		optimization: await include('build/optimization.webpack')({buildId}),
		devtool: await include('build/devtool.webpack')
	};
}

const
	build = include('build/entities.webpack'),
	buildEvent = new EventEmitter({maxListeners: build.MAX_PROCESS});

const predefinedTasks = $C(build.MAX_PROCESS).map((el, buildId) => new Promise((resolve) => {
	buildEvent.once(`build.${buildId}`, resolve);
	buildEvent.once(`build.all`, () => resolve(include('build/empty.webpack')({buildId})));
}));

const tasks = (async () => {
	await include('build/snakeskin.webpack');

	const
		graph = await build;

	const tasks = global.WEBPACK_CONFIG = await (
		config.build.single ? buildFactory(graph.entry) : $C(graph.processes).async.map((el, i) => buildFactory(el, i))
	);

	$C(tasks).forEach((config, i) => {
		buildEvent.emit(`build.${i}`, config);
	});

	buildEvent.emit(`build.all`, tasks[0]);
	buildEvent.removeAllListeners();

	return tasks;
})();

// FIXME: https://github.com/trivago/parallel-webpack/issues/76
module.exports = /[/\\]webpack\b/.test(process.argv[1]) ? tasks : predefinedTasks;
