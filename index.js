#!/usr/bin/env node

/**
 * DISCLAIMER
 * This code is directly taken from Plop's v2.0.0 GitHub.
 * Little has been done to modify the code other than massively cutting down the code
 */

'use strict';

const Liftoff = require('liftoff');
const args = process.argv.slice(2);
const argv = require('minimist')(args);
const v8flags = require('v8flags');
const interpret = require('interpret');
const chalk = require('chalk');

const nodePlop = require('node-plop');
const out = require('./help-out');
const globalPkg = require('./package.json');
const path = require('path');

const Plop = new Liftoff({
	name: 'plop',
	extensions: interpret.jsVariants,
	v8flags: v8flags
});

Plop.launch({
	cwd: argv.cwd,
	configPath: path.resolve(__dirname, './plopfile.js'),
	require: argv.require,
	completion: argv.completion
}, run);

function run(env) {
	const plopfilePath = env.configPath;

	// handle request for usage and options
	// if (argv.help || argv.h) {
	// 	out.displayHelpScreen();
	// 	process.exit(0);
	// }

	// handle request for version number
	if (argv.version || argv.v) {
		if (!!env.modulePackage.version && (env.modulePackage.version !== globalPkg.version)) {
			console.log(chalk.yellow('CLI version'), globalPkg.version);
			console.log(chalk.yellow('Local version'), env.modulePackage.version);
		} else {
			console.log(globalPkg.version);
		}
		return;
	}

	// set the default base path to the plopfile directory
	const plop = nodePlop(plopfilePath, {
		force: argv.force || argv.f
	});
	const bypassArr = argv._;
	doThePlop(plop.getGenerator('generate'), bypassArr);
}

/////
// everybody to the plop!
//
function doThePlop(generator, bypassArr) {
	generator.runPrompts(bypassArr)
		.then(generator.runActions)
		.then(function (result) {
			result.changes.forEach(function(line) {
				console.log(chalk.green('[SUCCESS]'), line.type, line.path);
			});
			result.failures.forEach(function (line) {
				const logs = [chalk.red('[FAILED]')];
				if (line.type) { logs.push(line.type); }
				if (line.path) { logs.push(line.path); }

				const error = line.error || line.message;
				logs.push(chalk.red(error));

				console.log.apply(console, logs);
			});
		})
		.catch(function (err) {
			console.error(chalk.red('[ERROR]'), err.message);
			process.exit(1);
		});
}

