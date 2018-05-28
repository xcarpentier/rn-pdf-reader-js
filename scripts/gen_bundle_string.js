#!/usr/bin/env node

const fs = require('fs')
const path = require('path');

const encoding = { encoding: 'utf8' };
const originPath = path.join(__dirname, '../react-pdf/dist/bundle.js')
const originPath0 = path.join(__dirname, '../react-pdf/dist/0.bundle.js')
const originPath1 = path.join(__dirname, '../react-pdf/dist/1.bundle.js')
const destinationPath = path.join(__dirname, '../bundleContainer.js')

const read = path => fs.readFileSync(path, encoding)
const toBase64 = str => Buffer.from(str).toString('base64')

const bundleString = read(originPath)
const bundleString0 = read(originPath0)
const bundleString1 = read(originPath1)

const bundleContainerFileContent = `
import { Base64 } from 'js-base64';

const bundle = '${toBase64(bundleString)}';
const bundle_0 = '${toBase64(bundleString0)}';
const bundle_1 = '${toBase64(bundleString1)}';

export default (num) => {
  if(!num) {
    return Base64.decode(bundle)
  } else if(num === 0) {
    return Base64.decode(bundle_0)
  } else if(num === 1) {
    return Base64.decode(bundle_1)
  }
  throw 'unknown bundle number'
};
`
if(fs.existsSync(destinationPath)) {
  fs.unlinkSync(destinationPath)
}
fs.writeFileSync(destinationPath, bundleContainerFileContent, encoding)
