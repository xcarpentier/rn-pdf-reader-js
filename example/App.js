import React from 'react'
import { StyleSheet, View } from 'react-native'
import PdfReader from 'rn-pdf-reader-js'
import { Constants } from 'expo'

export default class App extends React.Component {
  render() {
    return (
      <PdfReader source={{ uri: 'http://www.pdf995.com/samples/pdf.pdf' }} />
    )
  }
}
