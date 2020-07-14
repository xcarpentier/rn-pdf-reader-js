import React from 'react'
import PdfReader from './src/'
import {
  WebViewErrorEvent,
  WebViewHttpErrorEvent,
} from 'react-native-webview/lib/WebViewTypes'
import { View, Text, Modal, Button, SafeAreaView, Switch } from 'react-native'

const base64 =
  'data:application/pdf;base64,JVBERi0xLjcKCjEgMCBvYmogICUgZW50cnkgcG9pbnQKPDwKICAvVHlwZSAvQ2F0YWxvZwog' +
  'IC9QYWdlcyAyIDAgUgo+PgplbmRvYmoKCjIgMCBvYmoKPDwKICAvVHlwZSAvUGFnZXMKICAv' +
  'TWVkaWFCb3ggWyAwIDAgMjAwIDIwMCBdCiAgL0NvdW50IDEKICAvS2lkcyBbIDMgMCBSIF0K' +
  'Pj4KZW5kb2JqCgozIDAgb2JqCjw8CiAgL1R5cGUgL1BhZ2UKICAvUGFyZW50IDIgMCBSCiAg' +
  'L1Jlc291cmNlcyA8PAogICAgL0ZvbnQgPDwKICAgICAgL0YxIDQgMCBSIAogICAgPj4KICA+' +
  'PgogIC9Db250ZW50cyA1IDAgUgo+PgplbmRvYmoKCjQgMCBvYmoKPDwKICAvVHlwZSAvRm9u' +
  'dAogIC9TdWJ0eXBlIC9UeXBlMQogIC9CYXNlRm9udCAvVGltZXMtUm9tYW4KPj4KZW5kb2Jq' +
  'Cgo1IDAgb2JqICAlIHBhZ2UgY29udGVudAo8PAogIC9MZW5ndGggNDQKPj4Kc3RyZWFtCkJU' +
  'CjcwIDUwIFRECi9GMSAxMiBUZgooSGVsbG8sIHdvcmxkISkgVGoKRVQKZW5kc3RyZWFtCmVu' +
  'ZG9iagoKeHJlZgowIDYKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDEwIDAwMDAwIG4g' +
  'CjAwMDAwMDAwNzkgMDAwMDAgbiAKMDAwMDAwMDE3MyAwMDAwMCBuIAowMDAwMDAwMzAxIDAw' +
  'MDAwIG4gCjAwMDAwMDAzODAgMDAwMDAgbiAKdHJhaWxlcgo8PAogIC9TaXplIDYKICAvUm9v' +
  'dCAxIDAgUgo+PgpzdGFydHhyZWYKNDkyCiUlRU9G'
// const uri = 'http://gahp.net/wp-content/uploads/2017/09/sample.pdf'
const uri = 'https://www.dropbox.com/s/r7nfdzj6h2kosnh/bhjbjbj.pdf?dl=0&raw=1'

function App() {
  const [error, setError] = React.useState<
    WebViewErrorEvent | WebViewHttpErrorEvent | string | undefined
  >(undefined)
  const [visible, setVisible] = React.useState<boolean>(false)
  const [pdfType, setPdfType] = React.useState<boolean>(false)
  const [useGoogleReader, setUseGoogleReader] = React.useState<boolean>(false)
  const [withScroll, setWithScroll] = React.useState<boolean>(false)
  const [withPinchZoom, setWithPinchZoom] = React.useState<boolean>(false)
  if (error) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          padding: 15,
        }}
      >
        <Text style={{ color: 'red', textAlign: 'center' }}>
          {error.toString()}
        </Text>
      </View>
    )
  }

  return (
    <SafeAreaView
      style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
    >
      <Button title='Show PDF' onPress={() => setVisible(true)} />
      <Text>{'\nPDF type (uri -> base64)'}</Text>
      <Switch
        value={pdfType}
        onValueChange={(value) => {
          setPdfType(value)
          if (value) {
            setUseGoogleReader(false)
          }
        }}
      />
      <Text>{'\nGoogle Reader?'}</Text>
      <Switch
        value={useGoogleReader}
        onValueChange={(value) => {
          setUseGoogleReader(value)
          if (value) {
            setPdfType(false)
          }
        }}
      />
      <Text>{'\nWith Scroll?'}</Text>
      <Switch value={withScroll} onValueChange={setWithScroll} />
      <Text>{'\nWith Pinch Zoom?'}</Text>
      <Switch value={withPinchZoom} onValueChange={setWithPinchZoom} />
      <Modal {...{ visible }}>
        <SafeAreaView style={{ flex: 1 }}>
          <Button title='Hide PDF' onPress={() => setVisible(false)} />
          <PdfReader
            source={pdfType ? { base64 } : { uri }}
            onError={setError}
            {...{ useGoogleReader, withScroll, withPinchZoom }}
            customStyle={{
              readerContainerZoomContainer: {
                borderRadius: 30,
                backgroundColor: 'black',
              },
              readerContainerZoomContainerButton: {
                borderRadius: 30,
              },
            }}
          />
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  )
}

export default App
