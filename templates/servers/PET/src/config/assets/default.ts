module.exports = {
  models: 'src/modules/*/models/*.js',
  routes: 'src/modules/*/routes/*.js',
  config: 'src/modules/*/config/*.js',
  policies: 'src/modules/*/policies/*.js',
  sockets: 'src/modules/*/sockets/*.js',
} as DefaultAssets;

export interface DefaultAssets {
  models: string;
  routes: string;
  config: string;
  policies: string;
  sockets: string;
}