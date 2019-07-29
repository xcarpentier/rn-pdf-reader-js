<h1 align="center">PDF reader for Expo</h1>
<p align="center">Android support 🚀</p>

<p align="center">
   <img width="250" src="https://thumbs.gfycat.com/DeadPoisedBrownbutterfly-max-14mb.gif" />
   <br/>
   <br/>
   <br/>
   <br/>
   <a href="https://www.npmjs.com/package/rn-pdf-reader-js"><img alt="npm version" src="https://badge.fury.io/js/rn-pdf-reader-js.svg"/>
   <a href="http://reactnative.gallery/xcarpentier/rn-pdf-reader-js"><img src="https://img.shields.io/badge/reactnative.gallery-%F0%9F%8E%AC-green.svg"/></a>
</a>
</p>
<p align="center">
  <a href="https://exp.host/@xcarpentier/rn-pdf-reader-example">💥 DEMO 💥</a>
</p>

## Read a PDF just with JS (no native libs needed)

## Limitations

- **Display file only on full screen.**
- **Embeded images binary are not display (yet) in Android**

[PRs are welcome...](https://github.com/xcarpentier/rn-pdf-reader-js/pulls)

## Example

```javascript
import React from 'react'
import { StyleSheet, View } from 'react-native'
import PDFReader from 'rn-pdf-reader-js'
import { Constants } from 'expo'

export default class App extends React.Component {
  render() {
    return (
      <View style={styles.container}>
        <PDFReader
          source={{
            uri: 'http://gahp.net/wp-content/uploads/2017/09/sample.pdf',
          }}
        />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Constants.statusBarHeight,
    backgroundColor: '#ecf0f1',
  },
})
```

## Props

- source: `Object`
  - uri?: `string` - can be local or served on the web (ie. start withs `https://` or `file://`)
  - base64?: `string` - should start with `data:application/pdf;base64,`. A base64 encoded pdf file tends to start with `JVBERi0xL` so your complete string should look soemthing like this: `data:application/pdf;base64,JVBERi0xL...`
- style: `object` - style props to override default container style
- webviewStyle: `object` - style props to override default WebView style
- onLoad: `func` - callback that runs after WebView is loaded
- noLoader: `boolean` - show/hide the ActivityIndicator. Default is false

## Requirements

- Use it into Expo app (from expo client, Standalone app or ExpoKit app).
- Because we need to have access to `Expo.FileSystem`
- Only React-Native 0.54+ support, Expo SDK 27

## Features

- **For Android, use react-pdf / pdfjs in the webview**
- For iOS devices, display file directly to the WebView

## What rn-pdf-reader-js use?

- react-pdf (pdf.js)
- WebView
- Expo FileSystem API
- Base64

## FAQ

- [Why the component doesn't render PDF?](https://github.com/xcarpentier/rn-pdf-reader-js/issues/15#issuecomment-397306743)

## Hire an expert!

Looking for a ReactNative freelance expert with more than 12 years experience? Contact me from my [website](https://xaviercarpentier.com)!
