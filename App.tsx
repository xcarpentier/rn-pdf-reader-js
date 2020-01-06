import React from 'react'
import PdfReader from './src/'

export default class App extends React.Component {
  render() {
    return (
      <PdfReader
        source={{
          uri: 'http://gahp.net/wp-content/uploads/2017/09/sample.pdf',
        }}
      />
    )
  }
}
