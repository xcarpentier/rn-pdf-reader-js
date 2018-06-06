<h1 align="center">PDF reader for Expo</h1>
<p align="center">Android support 🚀</p>

<p align="center">
   <img width="200" src="https://image.ibb.co/hqOy5y/Screenshot_20180531_185949.png" />
   <br/>
   <br/>
   <br/>
   <br/>
   <a href="https://www.npmjs.com/package/rn-pdf-reader-js"><img alt="npm version" src="https://badge.fury.io/js/rn-pdf-reader-js.svg"/>
   <a href="http://reactnative.gallery"><img src="https://img.shields.io/badge/reactnative.gallery-%F0%9F%8E%AC-green.svg"/></a>
</a>
</p>
<p align="center">
  <a href="https://exp.host/@xcarpentier/rn-pdf-reader-example">💥 DEMO 💥</a>
</p>

## Read a PDF just with JS (no native libs needed)

## Example

```javascript
import React from 'react';
import { StyleSheet, View } from 'react-native';
import PDFReader from 'rn-pdf-reader-js';
import { Constants } from 'expo';

export default class App extends React.Component {
  render() {
    return (
      <View style={styles.container}>
        <PDFReader
          source={{ uri: "http://gahp.net/wp-content/uploads/2017/09/sample.pdf" }}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Constants.statusBarHeight,
    backgroundColor: '#ecf0f1',
  },
});
```

## Props
* source: `Object`
  * uri?: `string` - can be local or served on the web (ie. start withs `https://` or `file://`)
  * base64?: `string` - should start with `data`

## Requirements
* Use it into Expo app (from expo client, Standalone app or ExpoKit app).
* Because we need to have access to `Expo.FileSystem`
* Only React-Native 0.54+ support, Expo SDK 27

## Features
* **For Android, use react-pdf / pdfjs in the webview**
* For iOS devices, display file directly to the WebView

## What rn-pdf-reader-js use?

* react-pdf (pdf.js)
* WebView
* Expo FileSystem API
* Base64

