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
  <a href="#hire-an-expert"><img src="https://img.shields.io/badge/%F0%9F%92%AA-hire%20an%20expert-brightgreen"/></a>
</p>
<p align="center">
  <a href="https://exp.host/@xcarpentier/rn-pdf-reader-example">💥 DEMO 💥</a>
</p>

## Read a PDF just with JS (no native libs needed)

## Limitations

- **Display file only on full screen.**

[PRs are welcome...](https://github.com/xcarpentier/rn-pdf-reader-js/pulls)

## Example

```tsx
import * as React from 'react'
import { StyleSheet, View } from 'react-native'
import PDFReader from 'rn-pdf-reader-js'
import Constants from 'expo-constants'

export default class App extends React.Component {
  render() {
    return (
      <PDFReader
        source={{
          uri: 'http://gahp.net/wp-content/uploads/2017/09/sample.pdf',
        }}
      />
    )
  }
}
```

## Props

```tsx
interface Source {
  uri?: string // can be local or served on the web (ie. start with `https://` or `file://`)
  base64?: string // should start with `data:application/pdf;base64,`. A base64 encoded pdf file tends to start with `JVBERi0xL` so your complete string should look something like this: `data:application/pdf;base64,JVBERi0xL...`
  headers?: { [key: string]: string }
}

interface Props {
  source: Source
  style?: View['props']['style'] // style props to override default container style
  webviewStyle?: WebView['props']['style'] // style props to override default WebView style
  noLoader?: boolean
  onLoad?(): void // callback that runs after WebView is loaded
  onLoadEnd?(): void // callback that runs after WebView is loaded
  onError?(): void // callback that runs when WebView is on error
}
```

## Requirements

- Use it into Expo app (from expo client, Standalone app or ExpoKit app).
- Only React-Native 0.60+ support, **Expo SDK 36**

## Features

- **For Android, use react-pdf / pdfjs in the webview**
- For iOS devices, display file directly to the WebView (react-native-webview)

## What rn-pdf-reader-js use?

- react-pdf (pdf.js)
- WebView
- Base64

## FAQ

- [Why the component doesn't render PDF?](https://github.com/xcarpentier/rn-pdf-reader-js/issues/15#issuecomment-397306743)

## Hire an expert!

Looking for a ReactNative freelance expert with more than 12 years experience? Contact me from my [website](https://xaviercarpentier.com)!
