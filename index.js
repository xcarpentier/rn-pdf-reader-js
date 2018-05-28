import React from 'react'
import { WebView, View, ActivityIndicator } from 'react-native'
import { FileSystem } from 'expo'
import bundle from './bundleContainer'

const { documentDirectory, writeAsStringAsync, deleteAsync } = FileSystem

const viewerHtml = base64 => `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
  </head>
  <body>
    <!-- div id="file" data-file="${base64}"></div -->
    <div id="file" data-file='data:application/pdf;base64,JVBERi0xLjcKCjEgMCBvYmogICUgZW50cnkgcG9pbnQKPDwKICAvVHlwZSAvQ2F0YWxvZwogIC9QYWdlcyAyIDAgUgo+PgplbmRvYmoKCjIgMCBvYmoKPDwKICAvVHlwZSAvUGFnZXMKICAvTWVkaWFCb3ggWyAwIDAgMjAwIDIwMCBdCiAgL0NvdW50IDEKICAvS2lkcyBbIDMgMCBSIF0KPj4KZW5kb2JqCgozIDAgb2JqCjw8CiAgL1R5cGUgL1BhZ2UKICAvUGFyZW50IDIgMCBSCiAgL1Jlc291cmNlcyA8PAogICAgL0ZvbnQgPDwKICAgICAgL0YxIDQgMCBSIAogICAgPj4KICA+PgogIC9Db250ZW50cyA1IDAgUgo+PgplbmRvYmoKCjQgMCBvYmoKPDwKICAvVHlwZSAvRm9udAogIC9TdWJ0eXBlIC9UeXBlMQogIC9CYXNlRm9udCAvVGltZXMtUm9tYW4KPj4KZW5kb2JqCgo1IDAgb2JqICAlIHBhZ2UgY29udGVudAo8PAogIC9MZW5ndGggNDQKPj4Kc3RyZWFtCkJUCjcwIDUwIFRECi9GMSAxMiBUZgooSGVsbG8sIHdvcmxkISkgVGoKRVQKZW5kc3RyZWFtCmVuZG9iagoKeHJlZgowIDYKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDEwIDAwMDAwIG4gCjAwMDAwMDAwNzkgMDAwMDAgbiAKMDAwMDAwMDE3MyAwMDAwMCBuIAowMDAwMDAwMzAxIDAwMDAwIG4gCjAwMDAwMDAzODAgMDAwMDAgbiAKdHJhaWxlcgo8PAogIC9TaXplIDYKICAvUm9vdCAxIDAgUgo+PgpzdGFydHhyZWYKNDkyCiUlRU9G' data-type="file"></div>
    <div id="react-container"></div>
    <script type="text/javascript" src="bundle.js"></script>
    <script>

    </script>
  </body>
</html>
`

const indexHtmlPath = `${documentDirectory}index.html`
const bundleJsPath = `${documentDirectory}bundle.js`
const bundle_0_JsPath = `${documentDirectory}0.bundle.js`
const bundle_1_JsPath = `${documentDirectory}1.bundle.js`
const pdfTest = 'http://gahp.net/wp-content/uploads/2017/09/sample.pdf'

const writeWebViewReaderFileAsync = async base64 => {
  const html = viewerHtml(base64)
  await writeAsStringAsync(indexHtmlPath, viewerHtml(base64))
  await writeAsStringAsync(bundleJsPath, bundle())
  await writeAsStringAsync(bundle_0_JsPath, bundle(0))
  await writeAsStringAsync(bundle_1_JsPath, bundle(1))
}

export const removeFilesAsync = async () => {
  await deleteAsync(indexHtmlPath)
  await deleteAsync(bundleJsPath)
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

class PdfReader extends React.Component {

  state = { ready: false }

  static defaultProps = {
    file: pdfTest
  }

  async init() {
    const { file } = this.props
    let data = ''
    if(file.startsWith('http')) {
      data = await fetchPdfAsync(pdfTest)
    } else if (file.startsWith('data')) {
      data = file
    } else {
      alert('file props is required')
      return;
    }
    await writeWebViewReaderFileAsync(data)
    this.setState({ ready: true })
  }

  componentWillMount() {
    this.init()
  }

  render() {
    const { ready } = this.state
    if(ready) {
      return (
        <WebView
          style={{ flex: 1, backgroundColor: 'rgb(82, 86, 89)' }}
          source={{ uri: indexHtmlPath }}
          onError={e => alert(e)}
          onMessage={e => alert(e.nativeEvent.data)}
        />
      )
    }
    return <Loader />
  }
}

export default PdfReader
