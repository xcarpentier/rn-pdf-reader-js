import React from 'react'
import PdfReader from './src/'

export default class App extends React.Component {
  render() {
    return (
      <PdfReader
        source={{
          uri:
            'https://www.dropbox.com/s/6it8hd9hywbx5xe/Integrationtest1%20%284%29.pdf?dl=0&raw=1',
        }}
      />
    )
  }
}
