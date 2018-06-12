#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const crypto = require('crypto')
const encoding = { encoding: 'utf8' }
const originPath = path.join(__dirname, '../react-pdf/dist/bundle.js')
const destinationPath = path.join(__dirname, '../bundleContainer.android.js')

const read = path => fs.readFileSync(path, encoding)
const toBase64 = str => Buffer.from(str).toString('base64')

const bundleString = read(originPath)
const md5 = crypto.createHash('md5').update(bundleString).digest("hex")

// TODO: calculate md5 (ie. update new version)
const bundleContainerFileContent = `
import { Base64 } from 'js-base64';
const bundle = '${toBase64(bundleString)}';
export function getBundle() {
  return Base64.decode(bundle)
}
export function getBundleMd5() {
  return '${md5}'
}
`
if(fs.existsSync(destinationPath)) {
  fs.unlinkSync(destinationPath)
}
fs.writeFileSync(destinationPath, bundleContainerFileContent, encoding)
