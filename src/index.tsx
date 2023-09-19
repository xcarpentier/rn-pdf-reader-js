import * as React from 'react'
import * as CSS from 'csstype'
import { View, ActivityIndicator, Platform, StyleSheet } from 'react-native'
import { WebView } from 'react-native-webview'
import * as FileSystem from 'expo-file-system'
import {
  WebViewErrorEvent,
  WebViewNavigationEvent,
  WebViewSource,
  WebViewHttpErrorEvent,
} from 'react-native-webview/lib/WebViewTypes'

const {
  cacheDirectory,
  writeAsStringAsync,
  deleteAsync,
  getInfoAsync,
  EncodingType,
} = FileSystem

export type RenderType =
  | 'DIRECT_URL'
  | 'DIRECT_BASE64'
  | 'BASE64_TO_LOCAL_PDF'
  | 'URL_TO_BASE64'
  | 'GOOGLE_READER'
  | 'GOOGLE_DRIVE_VIEWER';

export interface CustomStyle {
  readerContainer?: CSS.Properties<any>
  readerContainerDocument?: CSS.Properties<any>
  readerContainerNumbers?: CSS.Properties<any>
  readerContainerNumbersContent?: CSS.Properties<any>
  readerContainerZoomContainer?: CSS.Properties<any>
  readerContainerZoomContainerButton?: CSS.Properties<any>
  readerContainerNavigate?: CSS.Properties<any>
  readerContainerNavigateArrow?: CSS.Properties<any>
}

export interface Source {
  uri?: string
  base64?: string
  headers?: { [key: string]: string }
}

export interface Props {
  source: Source
  style?: View['props']['style']
  webviewStyle?: WebView['props']['style']
  webviewProps?: WebView['props']
  noLoader?: boolean
  customStyle?: CustomStyle
  useGoogleReader?: boolean
  useGoogleDriveViewer?: boolean
  withScroll?: boolean
  withPinchZoom?: boolean
  maximumPinchZoomScale?: number
  onLoad?(event: WebViewNavigationEvent): void
  onLoadEnd?(event: WebViewNavigationEvent | WebViewErrorEvent): void
  onError?(event: WebViewErrorEvent | WebViewHttpErrorEvent | string): void
  // TODO: onReachedEnd?(): void
}

interface State {
  renderType?: RenderType
  ready: boolean
  data?: string
  renderedOnce: boolean
}

function viewerHtml(
  base64: string,
  customStyle?: CustomStyle,
  withScroll: boolean = false,
  withPinchZoom: boolean = false,
  maximumPinchZoomScale: number = 5,
): string {
  return `
<!DOCTYPE html>
<html>
  <head>
    <title>PDF reader</title>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, minimum-scale=1.0, initial-scale=1.0, maximum-scale=${
      withPinchZoom ? `${maximumPinchZoomScale}.0` : '1.0'
    }, user-scalable=${withPinchZoom ? 'yes' : 'no'}" />
    <script src="https://cdn.jsdelivr.net/npm/pdfjs-dist@2.1.266/build/pdf.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/pdfjs-dist@2.1.266/web/pdf_viewer.min.js"></script>
    <script
      crossorigin
      src="https://unpkg.com/react@16/umd/react.production.min.js"
    ></script>
    <script
      crossorigin
      src="https://unpkg.com/react-dom@16/umd/react-dom.production.min.js"
    ></script>
    <script>
      pdfjsLib.GlobalWorkerOptions.workerSrc =
        'https://cdn.jsdelivr.net/npm/pdfjs-dist@2.1.266/build/pdf.worker.min.js'
    </script>
    <script type="application/javascript">
      try {
        window.CUSTOM_STYLE = JSON.parse('${JSON.stringify(
          customStyle ?? {},
        )}');
      } catch (error) {
        window.CUSTOM_STYLE = {}
      }
      try {
        window.WITH_SCROLL = JSON.parse('${JSON.stringify(withScroll)}');
      } catch (error) {
        window.WITH_SCROLL = {}
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

// PATHS
const bundleJsPath = `${cacheDirectory}bundle.js`
const htmlPath = `${cacheDirectory}index.html`
const pdfPath = `${cacheDirectory}file.pdf`

async function writeWebViewReaderFileAsync(
  data: string,
  customStyle?: CustomStyle,
  withScroll?: boolean,
  withPinchZoom?: boolean,
  maximumPinchZoomScale?: number,
): Promise<void> {
  const { exists, md5 } = await getInfoAsync(bundleJsPath, { md5: true })
  const bundleContainer = require('./bundleContainer')
  if (__DEV__ || !exists || bundleContainer.getBundleMd5() !== md5) {
    await writeAsStringAsync(bundleJsPath, bundleContainer.getBundle())
  }
  await writeAsStringAsync(
    htmlPath,
    viewerHtml(
      data,
      customStyle,
      withScroll,
      withPinchZoom,
      maximumPinchZoomScale,
    ),
  )
}

async function writePDFAsync(base64: string) {
  await writeAsStringAsync(
    pdfPath,
    base64.replace('data:application/pdf;base64,', ''),
    { encoding: EncodingType.Base64 },
  )
}

export async function removeFilesAsync(): Promise<void> {
  const { exists: htmlPathExist } = await getInfoAsync(htmlPath)
  if (htmlPathExist) {
    await deleteAsync(htmlPath, { idempotent: true })
  }

  const { exists: pdfPathExist } = await getInfoAsync(pdfPath)
  if (pdfPathExist) {
    await deleteAsync(pdfPath, { idempotent: true })
  }
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
      Object.keys(source.headers).forEach((key) => {
        xhr.setRequestHeader(key, source.headers![key])
      })
    }

    xhr.responseType = 'blob'
    xhr.send()
  })
}

const getGoogleReaderUrl = (url: string) =>
  `https://docs.google.com/viewer?url=${url}`
const getGoogleDriveUrl = (url: string) =>
  `https://drive.google.com/viewerng/viewer?embedded=true&url=${url}`

const Loader = () => (
  <View
    style={{
      ...StyleSheet.absoluteFillObject,
      justifyContent: 'center',
      alignItems: 'center',
    }}
  >
    <ActivityIndicator size='large' />
  </View>
)

class PdfReader extends React.Component<Props, State> {
  static defaultProps = {
    withScroll: false,
    noLoader: false,
  }

  state = {
    renderType: undefined,
    ready: false,
    data: undefined,
    renderedOnce: false,
  }

  validate = () => {
    const { onError: propOnError, source } = this.props
    const { renderType } = this.state
    const onError = propOnError !== undefined ? propOnError : console.error
    if (!renderType || !source) {
      onError('source is undefined')
    } else if (
      (renderType === 'DIRECT_URL' ||
        renderType === 'GOOGLE_READER' ||
        renderType === 'GOOGLE_DRIVE_VIEWER' ||
        renderType === 'URL_TO_BASE64') &&
      (!source.uri ||
        !(
          source.uri.startsWith('http') ||
          source.uri.startsWith('file') ||
          source.uri.startsWith('content')
        ))
    ) {
      onError(
        `source.uri is undefined or not started with http, file or content source.uri = ${source.uri}`,
      )
    } else if (
      (renderType === 'BASE64_TO_LOCAL_PDF' ||
        renderType === 'DIRECT_BASE64') &&
      (!source.base64 ||
        !source.base64.startsWith('data:application/pdf;base64,'))
    ) {
      onError(
        'Base64 is not correct (ie. start with data:application/pdf;base64,)',
      )
    }
  }

  init = async () => {
    try {
      const {
        source,
        customStyle,
        withScroll,
        withPinchZoom,
        maximumPinchZoomScale,
      } = this.props
      const { renderType } = this.state
      switch (renderType!) {
        case 'GOOGLE_DRIVE_VIEWER': {
          break;
        }
        
        case 'URL_TO_BASE64': {
          const data = await fetchPdfAsync(source)
          await writeWebViewReaderFileAsync(
            data!,
            customStyle,
            withScroll,
            withPinchZoom,
            maximumPinchZoomScale,
          )
          break
        }

        case 'DIRECT_BASE64': {
          await writeWebViewReaderFileAsync(
            source.base64!,
            customStyle,
            withScroll,
            withPinchZoom,
            maximumPinchZoomScale,
          )
          break
        }

        case 'BASE64_TO_LOCAL_PDF': {
          await writePDFAsync(source.base64!)
          break
        }

        default:
          break
      }

      this.setState({ ready: true })
    } catch (error) {
      alert(`Sorry, an error occurred. ${error.message}`)
      console.error(error)
    }
  }

  getRenderType = () => {
    const {
      useGoogleReader,
      useGoogleDriveViewer,
      source: { uri, base64 },
    } = this.props

    if (useGoogleReader) {
      return 'GOOGLE_READER'
    }

    if (useGoogleDriveViewer) {
      return 'GOOGLE_DRIVE_VIEWER';
    }

    if (Platform.OS === 'ios') {
      if (uri !== undefined) {
        return 'DIRECT_URL'
      }
      if (base64 !== undefined) {
        return 'BASE64_TO_LOCAL_PDF'
      }
    }

    if (base64 !== undefined) {
      return 'DIRECT_BASE64'
    }

    if (uri !== undefined) {
      return 'URL_TO_BASE64'
    }

    return undefined
  }

  getWebviewSource = (): WebViewSource | undefined => {
    const { renderType } = this.state
    const {
      source: { uri = '', headers },
      onError,
    } = this.props
    switch (renderType!) {
      case 'GOOGLE_READER':
        return { uri: getGoogleReaderUrl(uri!) }
      case 'GOOGLE_DRIVE_VIEWER':
        return { uri: getGoogleDriveUrl(uri) };
      case 'DIRECT_BASE64':
      case 'URL_TO_BASE64':
        return { uri: htmlPath }
      case 'DIRECT_URL':
        return { uri: uri!, headers }
      case 'BASE64_TO_LOCAL_PDF':
        return { uri: pdfPath }
      default: {
        onError!('Unknown RenderType')
        return undefined
      }
    }
  }

  componentDidMount() {
    this.setState({ renderType: this.getRenderType() }, () => {
      console.debug(this.state.renderType)
      this.validate()
      this.init()
    })
  }

  componentDidUpdate(prevProps: Props) {
    if (
      prevProps.source.uri !== this.props.source.uri ||
      prevProps.source.base64 !== this.props.source.base64
    ) {
      this.setState({ ready: false, renderType: this.getRenderType() })
      this.validate()
      this.init()
    }
  }

  componentWillUnmount() {
    const { renderType } = this.state
    if (
      renderType === 'DIRECT_BASE64' ||
      renderType === 'URL_TO_BASE64' ||
      renderType === 'BASE64_TO_LOCAL_PDF'
    ) {
      try {
        removeFilesAsync()
      } catch (error) {
        alert(`Error on removing file. ${error.message}`)
        console.error(error)
      }
    }
  }

  render() {
    const { ready, renderedOnce } = this.state

    const {
      style: containerStyle,
      webviewStyle,
      onLoad,
      noLoader,
      onLoadEnd,
      onError,
      webviewProps,
    } = this.props

    const originWhitelist = [
      'http://*',
      'https://*',
      'file://*',
      'data:*',
      'content:*',
    ]
    const style = [styles.webview, webviewStyle]
    const isAndroid = Platform.OS === 'android'
    if (ready) {
      const source: WebViewSource | undefined = this.getWebviewSource()
      return (
        <View style={[styles.container, containerStyle]}>
          <WebView
            {...{
              originWhitelist,
              onLoad: (event) => {
                this.setState({ renderedOnce: true })
                if (onLoad) {
                  onLoad(event)
                }
              },
              onLoadEnd,
              onError,
              onHttpError: onError,
              style,
              source: renderedOnce || !isAndroid ? source : { html: ''},
            }}
            allowFileAccess={isAndroid}
            allowFileAccessFromFileURLs={isAndroid}
            allowUniversalAccessFromFileURLs={isAndroid}
            scalesPageToFit={Platform.select({ android: false })}
            mixedContentMode={isAndroid ? 'always' : undefined}
            sharedCookiesEnabled={false}
            startInLoadingState={!noLoader}
            renderLoading={() => (noLoader ? <View /> : <Loader />)}
            {...webviewProps}
          />
        </View>
      )
    }

    return !noLoader && !ready && <Loader />
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
})

export default PdfReader
