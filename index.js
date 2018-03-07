module.exports = function (plop) {
  plop.setGenerator('test', {
    prompts: [{
      type: 'confirm',
      name: 'wantTacos',
      message: 'Do you want tacos?'
    }],
    actions: function(data) {
      var actions = [];

      if(data.wantTacos) {
        actions.push({
          type: 'addMany',
          destination: 'folder/',
          templateFiles: 'templates/servers/PET/**/*'
        });
      } else {
        actions.push({
          type: 'add',
          path: 'folder/{{dashCase name}}.txt',
          templateFile: 'templates/burritos.txt'
        });
      }

      return actions;
    }
  });
};