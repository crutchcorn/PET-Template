const chalk = require('chalk');

module.exports = (function () {

	function displayHelpScreen() {
		console.log([
			'',
			chalk.bold('Usage:'),
			'  $ plop                 ' + chalk.dim('Select from a list of available generators'),
			'  $ plop <name>          ' + chalk.dim('Run a generator registered under that name'),
			'  $ plop <name> [input]  ' + chalk.dim('Run the generator with input data to bypass prompts'),
			'',
			chalk.bold('Options:'),
			'  -h, --help             ' + chalk.dim('Show this help display'),
			'  -i, --init             ' + chalk.dim('Generate a basic plopfile.js'),
			'  -v, --version          ' + chalk.dim('Print current version'),
			'  -f, --force            ' + chalk.dim('Run the generator forcefully'),
			'  --plopfile             ' + chalk.dim('Path to the plopfile'),
			'  --completion           ' + chalk.dim('Method to handle bash/zsh/whatever completions'),
			'  --cwd                  ' + chalk.dim('Directory from which relative paths are calculated against'),
			'  --require              ' + chalk.dim('String or array of modules to require before running plop'),
			'',
			chalk.bold('Examples:'),
			'  $ ' + chalk.blue('plop'),
			'  $ ' + chalk.blue('plop component'),
			'  $ ' + chalk.blue('plop component "name of component"'),
			'',
		].join('\n'));
	}

	return {
		displayHelpScreen: displayHelpScreen
	};
})();
