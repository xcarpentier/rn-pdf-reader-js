import React, { Component } from 'react';
import { render } from 'react-dom';
import { Document, Page } from 'react-pdf';
import './Reader.less';

class Reader extends Component {
  state = { numPages: null }

  onDocumentLoadSuccess = ({ numPages }) =>
    this.setState({ numPages })

  onError = () => alert('Error while loading document! ' + error.message)
  onSuccess = (t) => () => alert(t)

  render() {
    const { ready, numPages } = this.state;
    const { file } = this.props;
    return (
      <div className="Reader">
        <div className="Reader__container">
          <div className="Reader__container__document">
            <Document
              file={{ data: atob(file.split(',')[1])}}
              onLoadSuccess={this.onDocumentLoadSuccess}
              onLoadError={this.onError}
              onSourceError={this.onError}
              options={{
                nativeImageDecoderSupport: 'none',
              }}
            >
              {
                Array.from(
                  new Array(numPages),
                  (el, index) => (
                    <Page
                      key={`page_${index + 1}`}
                      pageNumber={index + 1}
                      onLoadError={this.onError}
                      onRenderError={this.onError}
                      onGetTextError={this.onError}
                    />
                  ),
                )
              }
            </Document>
          </div>
        </div>
      </div>
    );
  }
}
PDFJS.disableWebGL = true;
PDFJS.disableWorker = true;
const tagData = document.getElementById('file')
const file = tagData.getAttribute('data-file')
try {
  render(<Reader file={file} />, document.getElementById('react-container'));
} catch (error) {
  alert(error.message)
}
