const chalk = require('chalk');

const usage = [{
	command: 'plop',
	message: 'Select from a list of available generators'
}, {
	command: 'plop [input]',
	message: 'Run generate-me with input options'
}];

const options = [{
	command: '-h, --help',
	message: 'Show this help display'
}, {
	command: '-v, --version',
	message: 'Print current version'
}, {
	command: '-f, --force',
	message: 'Run the generator forcefully'
}];

module.exports = (function () {

	function getHelpMessage(generator) {
		const maxLen = Math.max(
			...generator.prompts.map(prompt => prompt.name.length),
			...usage.map(usag => usag.command.length),
			...options.map(option => option.command.length)
			) + 2; // Plus 2 because of the spacing
		// TODO: Add spacing as a variable so potential changes to it could be done very easily
		console.log([
			'',
			chalk.bold('Usage:'),
			...usage.map(usag =>
				'  $ ' + usag.command + ' '.repeat(maxLen - usag.command.length) + chalk.dim(usag.message)
			),
			'',
			chalk.bold('Options:'),
			...options.map(option =>
				'  ' + option.command + ' '.repeat(maxLen - option.command.length) + chalk.dim(option.message)
			),
			...generator.prompts.map(prompt =>
				'  --' + prompt.name +
				' '.repeat(maxLen - prompt.name.length) +
				chalk.dim(prompt.help ? prompt.help : prompt.message)
			),
			'',
			// TODO: Add examples to map listing of some kind
			chalk.bold('Examples:'),
			'  $ ' + chalk.blue('generate-me'),
			'  $ ' + chalk.blue('generate-me --name "Name of Project"'),
			''
		].join('\n'));
	}

	return {
		getHelpMessage: getHelpMessage
	};
})();
