import React from 'react'
import PdfReader from './src/'

export default class App extends React.Component {
  render() {
    return (
      <PdfReader source={{ uri: 'http://www.pdf995.com/samples/pdf.pdf' }} />
    )
  }
}
