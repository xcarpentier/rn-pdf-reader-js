##React Native PDF Reader - Expo Compatible (no linking!)
![example](https://thumbs.gfycat.com/DeadPoisedBrownbutterfly-max-14mb.gif)

## Read a PDF just with JS (no native libs or linking required)
Android support 🚀

## Limitations
- **Embeded in PDF binary image is not showing (yet) in Android** 

## Example with PDF link

```javascript
import React from 'react';
import { StyleSheet, View } from 'react-native';
import PDFReader from '@dmsi/rn-pdf-reader-js';
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
## Example with Base64 PDF
```javascript
import React from 'react';
import { View } from 'react-native';
import PDFViewer from '@dmsi/rn-pdf-reader-js';
import PropTypes from 'prop-types';

import PDFViewer from '../../rn-pdf-reader-js';

const TermsAndConditions = (props) => (
  <View style={{ flex: 1 }}>
    <PDFViewer
      source={{
        base64: props.data,
      }}
    />
  </View>
);

TermsAndConditions.propTypes = {
  data: PropTypes.string.isRequired,
};

export default TermsAndConditions;

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
* **Android specific: uses native React.js with react-pdf npm webpacked and compiled into base64 string which is displayed in a React Native WebView**
* For iOS devices, display file directly to the WebView - because iOS is awesome and provides all that for us.

## What rn-pdf-reader-js use?
* React.js
  * Used for the react-pdf component and any other browser components we might add.
* react-pdf (pdf.js) 
  * Used to render our PDF using divs and native text for clear PDF viewing
* WebView
  * Used to inject our React.js and react-pdf javascript in React Native
* Expo FileSystem API
* Base64

