import React, { Component } from 'react'
import { render } from 'react-dom'
import { Document, Page, setOptions } from 'react-pdf'
import Loader from "react-md-spinner"
import ReactCSSTransitionGroup from 'react-addons-css-transition-group'
import './Reader.less'

const ReactContainer = document.querySelector('#react-container')

setOptions({
  workerSrc: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.0.305/pdf.worker.min.js',
  disableWorker: false,
  cMapUrl: 'https://github.com/mozilla/pdfjs-dist/raw/master/cmaps/',
  cMapPacked: true
});

class Reader extends Component {
  state = {
    numPages: null,
    currentPage: 1,
    touchStartY: 0,
    touchEndY: 0,
    direction: 'down'
  }

  onDocumentLoadSuccess = ({ numPages }) =>
    this.setState({ numPages })

  onError = error => window.alert('Error while loading document! \n' + error.message)

  componentDidMount() {
    ReactContainer.addEventListener('touchstart', this.onTouchStart)
    ReactContainer.addEventListener('touchend', this.onTouchEnd)
  }

  onTouchStart = event => {
    event.preventDefault();
    this.setState({ touchStartY: event.changedTouches[0].clientY })
  }

  onTouchEnd = event => {
    event.preventDefault();
    this.setState(({ currentPage, touchStartY, numPages }) => {
      const { clientY: touchEndY } = event.changedTouches[0]
      if (touchStartY > touchEndY && currentPage < numPages) {
        return { currentPage: currentPage + 1, touchEndY, direction: 'down' }
      }
      if (touchStartY < touchEndY && currentPage > 1) {
        return { currentPage: currentPage - 1, touchEndY, direction: 'up' }
      }
    })
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
    const { numPages, currentPage, direction } = this.state;
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
              <ReactCSSTransitionGroup
                transitionName={direction === 'up' ? 'up-anim' : 'down-anim'}>
                <Page
                  loading={" "}
                  key={`page_${currentPage}`}
                  pageNumber={currentPage}
                  onLoadError={this.onError}
                  onRenderError={this.onError}
                  onGetTextError={this.onError}
                />
              </ReactCSSTransitionGroup>
            </Document>
          </div>
        </div>
      </div>
    );
  }
}

const tagData = document.querySelector('#file')
const file = tagData.getAttribute('data-file')
render(<Reader file={file} />, ReactContainer);
