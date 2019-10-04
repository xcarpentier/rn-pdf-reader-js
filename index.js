// @flow
import React, { Component } from 'react'
import {
  View,
  ActivityIndicator,
  Platform,
  StyleSheet,
} from 'react-native'
import { WebView } from 'react-native-webview'
import Constants from 'expo-constants'

function viewerHtml(base64: string): string {
  const bundleContainer = require('./bundleContainer')
  return `
 <!DOCTYPE html>
 <html>
   <head>
     <title>PDF reader</title>
     <meta charset="utf-8" />
     <meta name="viewport" content="width=device-width, minimum-scale=1.0, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
   </head>
   <body>
     <div id="file" data-file="${base64}"></div>
     <div id="react-container"></div>
     <script type="text/javascript">${bundleContainer.getBundle()}</script>
   </body>
 </html>
`
}

function readAsTextAsync(mediaBlob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const reader = new FileReader()
      reader.onloadend = () => {
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

async function fetchPdfAsync(source: Source): Promise<string> {
  const mediaBlob = await urlToBlob(source)
  return readAsTextAsync(mediaBlob)
}

async function urlToBlob(source: Source) {
  return new Promise((resolve, reject) => {
    var xhr = new XMLHttpRequest()
    xhr.onerror = reject
    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4) {
        resolve(xhr.response)
      }
    }

    xhr.open('GET', source.uri)

    if (source.headers && Object.keys(source.headers).length > 0) {
      Object.keys(source.headers).forEach((key) => {
        xhr.setRequestHeader(key, source.headers[key]);
      });
    }

    xhr.responseType = 'blob'
    xhr.send()
  })
}

const Loader = () => (
  <View style={{ flex: 1, justifyContent: 'center' }}>
    <ActivityIndicator size="large" />
  </View>
)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Constants.statusBarHeight,
    backgroundColor: '#ecf0f1',
  },
  webview: {
    flex: 1,
    backgroundColor: 'rgb(82, 86, 89)',
  },
})

type Source = {
  uri?: string,
  base64?: string,
  headers: { [key: string]: string }
}

type Props = {
  source: Source,
  style: object,
  webviewStyle: object,
  onLoad: func,
  noLoader: boolean
}

type State = {
  ready: boolean,
  android: boolean,
  ios: boolean,
  data?: string,
}

class PdfReader extends Component<Props, State> {
  state = { ready: false, android: false, ios: false, data: undefined }

  async init() {
    const { onLoad } = this.props;
    try {
      const { source } = this.props
      const ios = Platform.OS === 'ios'
      const android = Platform.OS === 'android'

      this.setState({ ios, android })
      let ready = false
      let data = undefined
      if (
        source.uri &&
        android &&
        (source.uri.startsWith('http') ||
          source.uri.startsWith('file') ||
          source.uri.startsWith('content'))
      ) {
        data = await fetchPdfAsync(source)
        ready= !!data
      } else if (source.base64 && source.base64.startsWith('data')) {
        data = source.base64
        ready = true
      } else if (ios) {
        data = source.uri
      } else {
        alert('source props is not correct')
        return
      }

      if(onLoad && ready === true) {
        onLoad();
      }

      this.setState({ ready, data })
    } catch (error) {
      alert('Sorry, an error occurred.')
      console.error(error)
    }
  }

  componentDidMount() {
    this.init()
  }

  render() {
    const { ready, data, ios, android } = this.state
    const { style, webviewStyle, onLoad, noLoader, onLoadEnd, onError  } = this.props

    if (data && ios) {
      return (
        <View style={[styles.container, style]}>
          {!noLoader && !ready && <Loader />}
          <WebView
            onLoad={()=>{
              this.setState({ready: true});
              if(onLoad) {
                onLoad();
              }
            }}
            originWhitelist={['http://*', 'https://*', 'file://*', 'data:*']}
            style={[styles.webview, webviewStyle]}
            source={{ uri: data }}
          />
        </View>
      )
    }

    if (ready && data && android) {
      return (
        <View style={[styles.container, style]}>
          <WebView
            onLoad={onLoad}
            onLoadEnd={onLoadEnd}
            onError={onError}
            allowFileAccess
            originWhitelist={['http://*', 'https://*', 'file://*', 'data:*']}
            style={[styles.webview, webviewStyle]}
            source={{ html: viewerHtml(data) }}
            mixedContentMode="always"
            scrollEnabled
          />
        </View>
      )
    }

    return <Loader />
  }
}

export default PdfReader
