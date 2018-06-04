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
💥DEMO: https://exp.host/@dev-team-e-medicus/rn-pdf-reader-example
</p>

## Read PDF just with JS

## Example

```javascript
import React from 'react';
import { StyleSheet, View } from 'react-native';
import PdfReader from 'rn-pdf-reader-js';
import { Constants } from 'expo';

export default class App extends React.Component {
  render() {
    return (
      <View style={styles.container}>
        <PdfReader file="http://gahp.net/wp-content/uploads/2017/09/sample.pdf" />
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

### Requirements
Use it with Expo

### What rn-pdf-reader-js use
* react-pdf
* WebView
* Expo Document api
* Base64
* ...
