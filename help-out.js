const chalk = require('chalk');

module.exports = (function () {

	function getHelpMessage(generator) {
		const maxLen = Math.max(...generator.prompts.map(prompt => prompt.name.length)) + 2;
		console.log([
			'',
			chalk.bold('Usage:'),
			'  $ plop' + ' '.repeat(maxLen - 'plop'.length) + chalk.dim('Select from a list of available generators'),
			'  $ plop [input]' + ' '.repeat(maxLen - 'plop [input]'.length) + chalk.dim('Run generate-me with input options'),
			'',
			chalk.bold('Options:'),
			'  -h, --help             ' + chalk.dim('Show this help display'),
			'  -v, --version          ' + chalk.dim('Print current version'),
			'  -f, --force            ' + chalk.dim('Run the generator forcefully'),
			...generator.prompts.map(prompt =>
				'  --' + prompt.name +
				' '.repeat(maxLen - prompt.name.length) +
				chalk.dim(prompt.help ? prompt.help : prompt.message)
			),
			'',
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
