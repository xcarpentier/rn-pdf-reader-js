import React from 'react'
import { WebView, View, ActivityIndicator } from 'react-native'
import { FileSystem } from 'expo'
// import bundle from './bundleContainer'

const viewerHtml = file => `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
  </head>
  <body>
    <p>${file || ''}</p>
    <div id="file" data-file="${file || ''}" data-type="file"></div>
    <div id="react-container"></div>
    <script type="text/javascript" src="https://raw.githubusercontent.com/xcarpentier/rn-pdf-reader-js/master/bundleContainer.js"></script>
    <script type="text/javascript">
      alert(document.getElementById('file').getAttribut('data-file'))
    </script>
  </body>
</html>
`

const indexHtml = `${FileSystem.documentDirectory}/index.html`
const bundleJs = `${FileSystem.documentDirectory}/bundle.js`

const pdfTest = 'http://gahp.net/wp-content/uploads/2017/09/sample.pdf'

const writeWebViewReaderFileAsync = () => {
  FileSystem.writeAsStringAsync(indexHtml, viewerHtml(pdfTest))
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
      return (
        <WebView
          style={{ flex: 1 }}
          source={{ uri: indexHtml }}
          onError={(e) => alert(e)}
        />
      )
    }
    return (
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <ActivityIndicator size="large"/>
      </View>
    )
  }
}

export default PdfReader
