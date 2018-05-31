import React, { Component } from 'react'
import { WebView, View, ActivityIndicator, Platform } from 'react-native'
import { FileSystem, IntentLauncherAndroid } from 'expo'
import bundle from './bundleContainer'

const { documentDirectory, writeAsStringAsync, deleteAsync } = FileSystem

const viewerHtml = base64 => `
<!DOCTYPE html>
<html>
  <head>
    <title>PDF reader</title>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
  </head>
  <body>
    <div id="file" data-file="${base64}"></div>
    <div id="react-container"></div>
    <script type="text/javascript" src="bundle.js"></script>
  </body>
</html>
`
const indexHtmlPath = `${documentDirectory}index.html`
const bundleJsPath = `${documentDirectory}bundle.js`

const writeWebViewReaderFileAsync = async base64 => {
  await writeAsStringAsync(indexHtmlPath, viewerHtml(base64))
  await writeAsStringAsync(bundleJsPath, bundle())
}

export const removeFilesAsync = async () => {
  await deleteAsync(indexHtmlPath)
}

const readAsTextAsync = mediaBlob => new Promise((resolve, reject) => {
  try {
    const fileReader = new FileReader()
    fileReader.onloadend = (e) => resolve(fileReader.result)
    fileReader.readAsDataURL(mediaBlob)
  } catch (error) {
    reject(error)
  }
})

const fetchPdfAsync = async (url) => {
  const result = await fetch(url)
  const mediaBlob = await result.blob()
  return readAsTextAsync(mediaBlob)
}

const Loader = () => (
  <View style={{ flex: 1, justifyContent: 'center' }}>
    <ActivityIndicator size="large"/>
  </View>
)

class PdfReader extends Component {

  state = { ready: false }

  async init() {
    const { file } = this.props
    const ios = Platform.OS === 'ios'
    const android = Platform.OS === 'android'

    this.setState({ ios, android })
    if(file.startsWith('http')) {
      const data = await fetchPdfAsync(file)
      this.setState({ data })
    } else if (file.startsWith('data')) {
      this.setState({ data: file })
      if (android) {
        await writeWebViewReaderFileAsync(file)
      }
    } else {
      alert('file props is required')
      return;
    }

    this.setState({ ready: true })
  }

  componentWillMount() {
    this.init()
  }

  render() {
    const { ready, data, ios, android, html } = this.state

    if (ready && ios) {
      return (
        <WebView
          style={{ flex: 1, backgroundColor: 'rgb(82, 86, 89)' }}
          source={{ uri: data }}
        />
      )
    }

    if (ready && android) {
      return (
        <WebView
          style={{ flex: 1, backgroundColor: 'rgb(82, 86, 89)' }}
          source={{ uri: indexHtmlPath }}
        />
      )
    }

    return <Loader />
  }
}

export default PdfReader
