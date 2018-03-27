import React from 'react'
import { WebView, View, ActivityIndicator } from 'react-native'
import { FileSystem } from 'expo'

const viewerHtml = `
<html>
  <head>
    <script src="https://mozilla.github.io/pdf.js/build/pdf.js"></script>
    </head>
    <body>
      <canvas id="the-canvas"></canvas>
      <script>
        var url = document.location.search.substr(5);
        var pdfjsLib = window['pdfjs-dist/build/pdf'];
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://mozilla.github.io/pdf.js/build/pdf.worker.js';

      // Asynchronous download of PDF
      var loadingTask = pdfjsLib.getDocument(url);
      loadingTask.promise.then(function(pdf) {
        console.log('PDF loaded');

        // Fetch the first page
        var pageNumber = 1;
        pdf.getPage(pageNumber).then(function(page) {
          console.log('Page loaded');

          var scale = 1.5;
          var viewport = page.getViewport(scale);

          // Prepare canvas using PDF page dimensions
          var canvas = document.getElementById('the-canvas');
          var context = canvas.getContext('2d');
          canvas.height = viewport.height;
          canvas.width = viewport.width;

          // Render PDF page into canvas context
          var renderContext = {
            canvasContext: context,
            viewport: viewport
          };
          var renderTask = page.render(renderContext);
          renderTask.then(function () {
            console.log('Page rendered');
          });
        });
      }, function (reason) {
        // PDF loading error
        console.error(reason);
      });
    </script>
  </body>
</html>
`
const fileUrl = `${FileSystem.documentDirectory}/index.html`

const pdfTest = 'http://gahp.net/wp-content/uploads/2017/09/sample.pdf'

const writeWebViewReaderFileAsync = () =>
  FileSystem.writeAsStringAsync(fileUrl, viewerHtml)

const downloadPDFAsync = (url) =>
  FileSystem.downloadAsync(url,`${FileSystem.documentDirectory}test.pdf`)


  class PdfReader extends React.Component {
  state = {
    ready: false,
    localUri: undefined
  }

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
      return <WebView style={{ flex: 1 }} source={{ uri:  `${fileUrl}?url=${url}`}} onError={e => alert(e)} />
    }
    return (
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <ActivityIndicator size="large"/>
      </View>
    )
  }
}

export default PdfReader
