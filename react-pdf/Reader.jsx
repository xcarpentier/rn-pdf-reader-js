import React, { Component } from 'react';
import { render } from 'react-dom';
import { Document, Page } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';

import './Reader.less';

const options = {
  cMapUrl: 'cmaps/',
  cMapPacked: true,
};

class Reader extends Component {
  state = {
    numPages: null,
    ready: false
  }

  onDocumentLoadSuccess = ({ numPages }) =>
    this.setState({
      numPages
    })

  render() {
    const { ready, numPages } = this.state;
    const { file } = this.props;
    return (
      <div className="Reader">
        <div className="Reader__container">
          <div className="Reader__container__document">
            <Document
              file={file}
              onLoadSuccess={this.onDocumentLoadSuccess}
              options={options}
            >
              {
                Array.from(
                  new Array(numPages),
                  (el, index) => (
                    <Page
                      key={`page_${index + 1}`}
                      pageNumber={index + 1}
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
const type = tagData.getAttribute('data-type')
render(<Reader file={file} type={type}/>, document.getElementById('react-container'));
