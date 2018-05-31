import React from 'react';
import { StyleSheet, Text, View, WebView } from 'react-native';
import PdfReader from 'rn-pdf-reader-js';
import { Constants } from 'expo';


// samples pdfs =>
// just text: http://gahp.net/wp-content/uploads/2017/09/sample.pdf
// with images: http://www.pdf995.com/samples/pdf.pdf


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
