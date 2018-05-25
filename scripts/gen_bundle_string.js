#!/usr/bin/env node

const fs = require('fs')
const path = require('path');

const encoding = { encoding: 'utf8' };
const originPath = path.join(__dirname, '../react-pdf/dist/bundle.js')
const destinationPath = path.join(__dirname, '../bundleContainer.js')

const bundleString = fs.readFileSync(originPath,encoding)

// const bundleContainerFileContent = `
// const bundle = '${bundleString}';
// export default bundle;
// `
if(fs.existsSync(destinationPath)) {
  fs.unlinkSync(destinationPath)
}
fs.writeFileSync(destinationPath, bundleString, encoding)
