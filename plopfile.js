// https://github.com/amwmedia/plop/blob/master/inquirer-prompts.md
const globOpts = {
	// Ensures all "hidden" files like .gitignore are added
	dot: true,
	// Fixes bugs with having node_modules in templates (for dev work)
	ignore: ['**/node_modules'],
};

module.exports = function (plop) {
	plop.setGenerator('generate', {
		prompts: [{
			type: 'input',
			name: 'name',
			message: 'Please input the name of your program:'
		}, {
			type: 'confirm',
			name: 'server',
			message: 'Do you want to generate a server?'
		}, {
			type: 'confirm',
			name: 'client',
			message: 'Do you want to generate a client?'
		}],
		actions: function (data) {
			var actions = [];

			if (data.server) {
				actions.push({
					type: 'addMany',
					destination: `${process.cwd()}/dist/server/`,
					base: 'templates/servers/PET',
					templateFiles: 'templates/servers/PET/**/*',
					globOptions: globOpts
				});
			}
			if (data.client) {
				actions.push({
					type: 'addMany',
					destination: `${process.cwd()}/dist/client/`,
					base: 'templates/clients/PETA',
					templateFiles: 'templates/clients/PETA/**/*',
					globOptions: globOpts
				});
			}

			return actions;
		}
	});
};