#!/usr/bin/env node

const fs = require('fs')
const path = require('path');

const encoding = { encoding: 'utf8' };
const originPath = path.join(__dirname, '../react-pdf/dist/bundle.js')
const destinationPath = path.join(__dirname, '../bundleContainer.js')

const read = path => fs.readFileSync(path, encoding)
const toBase64 = str => Buffer.from(str).toString('base64')

const bundleString = read(originPath)

const bundleContainerFileContent = `
import { Base64 } from 'js-base64';

const bundle = '${toBase64(bundleString)}';

export default () => Base64.decode(bundle);
`
if(fs.existsSync(destinationPath)) {
  fs.unlinkSync(destinationPath)
}
fs.writeFileSync(destinationPath, bundleContainerFileContent, encoding)
