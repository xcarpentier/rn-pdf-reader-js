import React from 'react'
import { WebView, View, ActivityIndicator } from 'react-native'
import { FileSystem } from 'expo'
// import bundle from './bundleContainer'

const viewerHtml = base64 => `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
  </head>
  <body>
    <div id="file" data-file="${file || ''}" data-type="file"></div>
    <div id="react-container"></div>
    <script type="text/javascript" src="bundle.js"></script></body>
</html>
`

const indexHtml = `${FileSystem.documentDirectory}/index.html`
const bundleJs = `${FileSystem.documentDirectory}/bundle.js`

const pdfTest = 'http://gahp.net/wp-content/uploads/2017/09/sample.pdf'

const writeWebViewReaderFileAsync = () => {
  FileSystem.writeAsStringAsync(indexHtml, viewerHtml())
  // FileSystem.writeAsStringAsync(bundleJs, bundle())
}

class PdfReader extends React.Component {
  state = { ready: false }

  async init() {
    await writeWebViewReaderFileAsync()
    this.setState({ ready: true })
  }

  componentWillMount() {
    this.init()
  }

  render() {
    const { url } = this.props
    const { ready } = this.state
    if(ready) {
      return <WebView style={{ flex: 1 }} source={{ uri: indexHtml }} />
    }
    return (
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <ActivityIndicator size="large"/>
      </View>
    )
  }
}

export default PdfReader
