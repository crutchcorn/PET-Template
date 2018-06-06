export default function (app) {
  // Define error pages
  app.route('/server-error').get((req, res) => res.status(500).json({
      error: 'Oops! Something went wrong...'
    }));

  // Return a 404 for all undefined api, module or lib routes
  app.route('/:url(api|modules|lib)/*').get((req, res) => res.status(404).format({
      error: 'Path not found'
    }));
};
