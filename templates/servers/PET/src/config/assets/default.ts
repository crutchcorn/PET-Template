module.exports = {
  models: 'src/modules/*/models/*.js',
  // This allows us to not use the core routes (which contain globs) to overwrite other routes
  routes: ['src/modules/!(core)/routes/**/*.js', 'src/modules/core/routes/**/*.js'],
  config: 'src/modules/*/config/*.js',
  policies: 'src/modules/*/policies/*.js',
  sockets: 'src/modules/*/sockets/*.js',
} as DefaultAssets;

export interface DefaultAssets {
  models: string[] | string;
  routes: string[] | string;
  config: string[] | string;
  policies: string[] | string;
  sockets: string[] | string;
}