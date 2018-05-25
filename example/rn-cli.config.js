
const path = require('path');
const blacklist = require('metro/src/blacklist');
const glob = require('glob-to-regexp');
const pak = require('../package.json');

const dependencies = Object.keys(pak.dependencies || {});
const peerDependencies = Object.keys(pak.peerDependencies || {});

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