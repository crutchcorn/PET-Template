// https://github.com/amwmedia/plop/blob/master/inquirer-prompts.md
module.exports = function (plop) {
  plop.setGenerator('test', {
    prompts: [{
      type: 'input',
      name: 'projectName',
      message: 'Please input the name of your program:'
    }, {
      type: 'confirm',
      name: 'wantServer',
      message: 'Do you want to generate a server?'
    }, {
      type: 'confirm',
      name: 'wantClient',
      message: 'Do you want to generate a client?'
    }],
    actions: function(data) {
      var actions = [];

      if(data.wantServer) {
        actions.push({
          type: 'addMany',
          destination: 'src/server/',
          base: 'templates/servers/PET',
          templateFiles: 'templates/servers/PET/**/*'
        });
      }
      if (data.wantClient) {
        actions.push({
          type: 'addMany',
          destination: 'src/client/',
          base: 'templates/clients/PETA',
          templateFiles: 'templates/clients/PETA/**/*'
        });
      }

      return actions;
    }
  });
};