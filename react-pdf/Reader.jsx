import React, { Component } from 'react';
import { render } from 'react-dom';
import { Document, Page } from 'react-pdf';
import Loader from "react-md-spinner";
import './Reader.less'

class Reader extends Component {
  state = { numPages: null }

  componentWillMount() {
    PDFJS.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.0.305/pdf.worker.min.js';
   }

  onDocumentLoadSuccess = ({ numPages }) =>
    this.setState({ numPages })

  onError = error => window.alert('Error while loading document! \n' + error.message)

  componentDidMount() {
    this._mounted = true;
  }

  componentWillUnmount() {
    this._mounted = false;
  }

  renderLoader = () => (
    <div style={{
      width: window.innerWidth,
      height: window.innerHeight,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#fff'
    }}>
      <Loader />
    </div>
  )

  render() {
    const { numPages } = this.state;
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
              loading={this.renderLoader()}
            >
              {
                Array.from(
                  new Array(numPages),
                  (el, index) => (
                    <Page
                      loading={" "}
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

const tagData = document.getElementById('file')
const file = tagData.getAttribute('data-file')
render(<Reader file={file} />, document.getElementById('react-container'));
