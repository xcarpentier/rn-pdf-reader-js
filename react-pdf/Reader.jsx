import React, { Component } from 'react'
import { render } from 'react-dom'
import { Document, Page, setOptions } from 'react-pdf'
import raf, { cancel } from 'raf'
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
    ready: true
  }

  pages = new Map()
  pageRefs = new Map()
  pageImgs = new Map()

  onDocumentLoadSuccess = ({ numPages }) => {
    this.setState({ numPages })
    this._doc.addEventListener('touchstart', this.onTouchStart)
    this._doc.addEventListener('touchend', this.onTouchEnd)
  }

  onError = error => window.alert('Error while loading document! \n' + error.message)

  componentWillUnmount() {
    this._doc.removeEventListener('touchstart', this.onTouchStart)
    this._doc.removeEventListener('touchend', this.onTouchEnd)
  }

  onTouchStart = event => {
    event.preventDefault()
    this.setState({ touchStartY: event.changedTouches[0].clientY })
  }

  onTouchEnd = event => {
    event.preventDefault()
    const { currentPage, touchStartY, numPages } = this.state
    const { clientY: touchEndY } = event.changedTouches[0]
    if (touchStartY > touchEndY && currentPage < numPages) {
      raf(this.down)
    }
    if (touchStartY < touchEndY && currentPage > 1) {
      raf(this.up)
    }
  }

  cache = currentPage => {
    if(!this.pageImgs.has(currentPage)) {
      this.pageImgs.set(
        currentPage,
        this.pageRefs.get(currentPage).children[0].toDataURL('image/png')
      )
    }
  }

  up = () => {
    const { currentPage } = this.state
    this.cache(currentPage)
    if(currentPage > 1) {
      this.setState({ currentPage: currentPage - 1 })
    }
    cancel(this.up)
  }


  down = () => {
    const { currentPage, numPages } = this.state
    this.cache(currentPage)
    if(currentPage < numPages) {
      this.setState({ currentPage: currentPage + 1 })
    }
    cancel(this.down)
  }

  goUp = event => {
    event.preventDefault()
    raf(this.up)
  }

  goDown = event => {
    event.preventDefault()
    raf(this.down)
  }

  renderLoader = () => (
    <div style={{
      width: window.innerWidth,
      height: window.innerHeight,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    }}>
      <p style={{color: '#fff'}}>
        Loading...
      </p>
    </div>
  )

  renderPage = pageNumber => {
    if(pageNumber > this.pages.size) {
      const thePage = (
        <Page
          loading={" "}
          inputRef={ref => ref && this.pageRefs.set(pageNumber, ref)}
          key={`page_${pageNumber}`}
          pageNumber={pageNumber}
          onLoadError={this.onError}
          onRenderError={this.onError}
          onGetTextError={this.onError}
        />
      )
      this.pages.set(pageNumber, thePage)
      return thePage
    } else {
      if(this.pageImgs.has(pageNumber)) {
        return (
          <img
            src={this.pageImgs.get(pageNumber)}
            style={{width: '100%'}}
          />
        )
      } else {
        return this.pages.get(pageNumber)
      }
    }
  }

  render() {
    const { numPages, currentPage } = this.state;
    const { file } = this.props;

    return (
      <div className="Reader">
        <div className="Reader__container">
          <div className="Reader__container__document">
            <Document
              inputRef={ref => this._doc = ref}
              file={{ data: atob(file.split(',')[1])}}
              onLoadSuccess={this.onDocumentLoadSuccess}
              onLoadError={this.onError}
              onSourceError={this.onError}
              loading={this.renderLoader()}
              options={{
                nativeImageDecoderSupport: 'none'
              }}
            >
              {this.renderPage(currentPage)}
            </Document>
          </div>
          <div className="Reader__container__numbers">
            <div className="Reader__container__numbers__content">
              {currentPage} / {numPages}
            </div>
          </div>
          <div className={"Reader__container__navigate"} >
            <div
              className="Reader__container__navigate__arrow"
              style={currentPage === 1 ? { color: 'rgba(255,255,255,0.2)' } : {}}
              onTouchEnd={this.goUp}
            >
              &#x25B2;
            </div>
            <div
              className="Reader__container__navigate__arrow"
              style={currentPage === numPages ? { color: 'rgba(255,255,255,0.2)' } : {}}
              onTouchEnd={this.goDown}
            >
              &#x25BC;
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const tagData = document.querySelector('#file')
const file = tagData.getAttribute('data-file')
render(<Reader file={file} />, ReactContainer);
