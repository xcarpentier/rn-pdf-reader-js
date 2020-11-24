#!/usr/bin/env node

const scripts = {
  pdfJs: 'pdf.min.js',
  pdfViewer: 'pdf_viewer.min.js',
  pdfWorker: 'pdf.worker.min.js',
  reactDom: 'react-dom.production.min.js',
  react: 'react.production.min.js'
}

const fs = require('fs')
const path = require('path')
const crypto = require('crypto')

const encoding = { encoding: 'utf8' }

Object.keys(scripts).forEach(function(key) {
  let fileName = scripts[key];
  let originPath = path.join(__dirname, `../src/assets/scripts/${fileName}`)
  let destinationPath = path.join(__dirname, `../src/${key}Container.ts`)

  let read = (path) => fs.readFileSync(path, encoding)
  let toBase64 = (str) => Buffer.from(str).toString('base64')

  let bundleString = read(originPath)
  let md5 = crypto.createHash('md5').update(bundleString).digest('hex')

  let bundleContainerFileContent = `
  import { Base64 } from 'js-base64';
  const bundle = '${toBase64(bundleString)}';
  export function getBundle() {
    return Base64.decode(bundle)
  }
  export function getBundleMd5() {
    return '${md5}'
  }
  `
  if (fs.existsSync(destinationPath)) {
    fs.unlinkSync(destinationPath)
  }
  fs.writeFileSync(destinationPath, bundleContainerFileContent, encoding)

})
