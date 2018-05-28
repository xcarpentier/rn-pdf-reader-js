const path = require('path');
const blacklist = require('metro/src/blacklist');
const glob = require('glob-to-regexp');
const pkg = require('../package.json');

const dependencies = Object.keys(pkg.dependencies || {});
const peerDependencies = Object.keys(pkg.peerDependencies || {});

module.exports = {
  getProjectRoots() {
    return [__dirname, path.resolve(__dirname, '..')];
  },
  getProvidesModuleNodeModules() {
    return [...dependencies, ...peerDependencies];
  },
  getBlacklistRE() {
    return blacklist([
      glob(`${path.resolve(__dirname, '..')}/node_modules/*`),
      glob(`${path.resolve(__dirname, '..')}/react-pdf/*`)
    ]);
  },
};