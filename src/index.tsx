import * as React from 'react'
import * as CSS from 'csstype'
import { View, ActivityIndicator, Platform, StyleSheet } from 'react-native'
import { WebView } from 'react-native-webview'
import * as FileSystem from 'expo-file-system'

const {
  cacheDirectory,
  writeAsStringAsync,
  deleteAsync,
  getInfoAsync,
} = FileSystem

interface CustomStyle {
  readerContainer?: CSS.Properties<any>
  readerContainerDocument?: CSS.Properties<any>
  readerContainerNumbers?: CSS.Properties<any>
  readerContainerNumbersContent?: CSS.Properties<any>
  readerContainerZoomContainer?: CSS.Properties<any>
  readerContainerZoomContainerButton?: CSS.Properties<any>
  readerContainerNavigate?: CSS.Properties<any>
  readerContainerNavigateArrow?: CSS.Properties<any>
}
function viewerHtml(base64: string, customStyle?: CustomStyle): string {
  return `
<!DOCTYPE html>
<html>
  <head>
    <title>PDF reader</title>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, minimum-scale=1.0, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <script type="application/javascript">
      try {
        window.CUSTOM_STYLE = JSON.parse('${JSON.stringify(
          customStyle ?? {},
        )}');
      } catch (error) {
        window.CUSTOM_STYLE = {}
      }
    </script>
  </head>
  <body>
     <div id="file" data-file="${base64}"></div>
     <div id="react-container"></div>
     <script type="text/javascript" src="bundle.js"></script>
   </body>
</html>
`
}

const bundleJsPath = `${cacheDirectory}bundle.js`
const htmlPath = `${cacheDirectory}index.html`
async function writeWebViewReaderFileAsync(
  data: string,
  customStyle?: CustomStyle,
): Promise<void> {
  const { exists, md5 } = await getInfoAsync(bundleJsPath, { md5: true })
  const bundleContainer = require('./bundleContainer')
  if (__DEV__ || !exists || bundleContainer.getBundleMd5() !== md5) {
    await writeAsStringAsync(bundleJsPath, bundleContainer.getBundle())
  }
  await writeAsStringAsync(htmlPath, viewerHtml(data, customStyle))
}

export async function removeFilesAsync(): Promise<void> {
  await deleteAsync(htmlPath)
}

function readAsTextAsync(mediaBlob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const reader = new FileReader()
      reader.onloadend = (_e: ProgressEvent<FileReader>) => {
        if (typeof reader.result === 'string') {
          return resolve(reader.result)
        }
        return reject(
          `Unable to get result of file due to bad type, waiting string and getting ${typeof reader.result}.`,
        )
      }
      reader.readAsDataURL(mediaBlob)
    } catch (error) {
      reject(error)
    }
  })
}

async function fetchPdfAsync(source: Source): Promise<string | undefined> {
  const mediaBlob: Blob | undefined = await urlToBlob(source)
  if (mediaBlob) {
    return readAsTextAsync(mediaBlob)
  }
  return undefined
}

async function urlToBlob(source: Source): Promise<Blob | undefined> {
  if (!source.uri) {
    return undefined
  }
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.onerror = reject
    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4) {
        resolve(xhr.response)
      }
    }

    xhr.open('GET', source.uri!)

    if (source.headers && Object.keys(source.headers).length > 0) {
      Object.keys(source.headers).forEach(key => {
        xhr.setRequestHeader(key, source.headers![key])
      })
    }

    xhr.responseType = 'blob'
    xhr.send()
  })
}

const Loader = () => (
  <View style={{ flex: 1, justifyContent: 'center' }}>
    <ActivityIndicator size='large' />
  </View>
)

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
})

interface Source {
  uri?: string
  base64?: string
  headers?: { [key: string]: string }
}

interface Props {
  source: Source
  style?: View['props']['style']
  webviewStyle?: WebView['props']['style']
  webviewProps?: WebView['props']
  noLoader?: boolean
  customStyle?: CustomStyle
  onLoad?(): void
  onLoadEnd?(): void
  onError?(): void
}

interface State {
  ready: boolean
  data?: string
}

class PdfReader extends React.Component<Props, State> {
  state = {
    ready: false,
    data: undefined,
  }

  init = async () => {
    try {
      const { source, customStyle } = this.props
      let ready = false
      let data
      if (
        source.uri &&
        (source.uri.startsWith('http') ||
          source.uri.startsWith('file') ||
          source.uri.startsWith('content'))
      ) {
        data = await fetchPdfAsync(source)
        ready = !!data
      } else if (
        source.base64 &&
        source.base64.startsWith('data:application/pdf;base64,')
      ) {
        data = source.base64
        ready = true
      } else {
        alert('source props is not correct')
        return
      }

      await writeWebViewReaderFileAsync(data!, customStyle)

      this.setState({ ready, data })
    } catch (error) {
      alert(`Sorry, an error occurred. ${error.message}`)
      console.error(error)
    }
  }

  componentDidMount() {
    this.init()
  }

  componentWillUnmount() {
    try {
      removeFilesAsync()
    } catch (error) {
      alert(`Error on removing file. ${error.message}`)
      console.error(error)
    }
  }

  render() {
    const { ready, data } = this.state

    const {
      style: containerStyle,
      webviewStyle,
      onLoad,
      noLoader,
      onLoadEnd,
      onError,
      webviewProps,
    } = this.props

    const originWhitelist = ['http://*', 'https://*', 'file://*', 'data:*']
    const style = [styles.webview, webviewStyle]
    const source = { uri: htmlPath }
    const isAndroid = Platform.OS === 'android'
    if (ready && data) {
      return (
        <View style={[styles.container, containerStyle]}>
          <WebView
            {...{
              originWhitelist,
              onLoad,
              onLoadEnd,
              onError,
              style,
              source,
            }}
            allowFileAccess={isAndroid}
            mixedContentMode={isAndroid ? 'always' : undefined}
            {...webviewProps}
          />
        </View>
      )
    }

    return (
      <View style={[styles.container, style]}>
        {!noLoader && !ready && <Loader />}
      </View>
    )
  }
}

export default PdfReader
