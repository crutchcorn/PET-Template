#!/usr/bin/env node

const Liftoff = require('liftoff');
const args = process.argv.slice(2);
// This is done to fix passing `-f` in and breaking plop-node
const noForceargs = args.filter(arg => arg !== '-f' && arg !== '--force');
const force = noForceargs.length !== args.length;
const argv = require('minimist')(noForceargs);
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
	configPath: path.resolve(__dirname, './plopfile.js')
}, run);

function run(env) {
	const plopfilePath = env.configPath;

	// set the default base path to the plopfile directory
	const plop = nodePlop(plopfilePath, {
		force: force
	});

	const generator = plop.getGenerator('generate');

	// handle request for usage and options
	if (argv.help || argv.h) {
		out.getHelpMessage(generator);
		process.exit(0);
	}

	// handle request for version number
	if (argv.version || argv.v) {
		if (env.modulePackage.version !== globalPkg.version) {
			console.log(chalk.yellow('CLI version'), globalPkg.version);
			console.log(chalk.yellow('Local version'), env.modulePackage.version);
		} else {
			console.log(globalPkg.version);
		}
		return;
	}

	// Get named prompts that are passed to the command line
	const promptNames = generator.prompts.map(prompt => prompt.name);

	if (Object.keys(argv).length > 0) {
		// Let's make sure we made no whoopsy-poos (AKA passing incorrect inputs)
		let errors = false;
		Object.keys(argv).forEach(arg => {
			if (!(promptNames.find(name => name === arg)) && arg !== '_') {
				console.error(chalk.red('[generate-me] ') + '"' + arg + '"' + ' is an invalid argument for "' + generator.name + '"');
				errors = true;
			}
		});
		if (errors) {
			out.getHelpMessage(generator);
			process.exit(1);
		}
		const bypassArr = promptNames.map(name => argv[name] ? argv[name] : '_');
		doThePlop(generator, bypassArr);
	} else {
		doThePlop(generator);
	}

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
				console.dir(line);
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
