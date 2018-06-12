import React, { Component } from 'react'
import { render } from 'react-dom'
import { Document, Page, setOptions } from 'react-pdf'
import raf, { cancel } from 'raf'
import Down from './components/down'
import Up from './components/up'
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
    ready: true,
    pageLoaded: false,
    pageRendered: false,
    getText: false,
    cached: false
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

  cache = pageKey => {
    if(!this.pageImgs.has(pageKey)) {
      this.pageImgs.set(
        pageKey,
        this.pageRefs.get(pageKey).children[0].toDataURL('image/png')
      )
    }
  }

  up = () => {
    const { currentPage } = this.state
    if(currentPage > 1) {
      const target = currentPage - 1
      this.setState({ currentPage: target })
      if(!this.pageImgs.has(target)) {
        this.setState({
          pageLoaded: false,
          pageRendered: false,
          getText: false
        })
      }
    }
    cancel(this.up)
  }


  down = () => {
    const { currentPage, numPages } = this.state
    if(currentPage < numPages) {
      const target = currentPage + 1
      this.setState({ currentPage: target })
      if(!this.pageImgs.has(target)) {
        this.setState({
          pageLoaded: false,
          pageRendered: false,
          getText: false
        })
      }
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

  renderImage = pageNumber => (
    <img
      src={this.pageImgs.get(pageNumber)}
      style={{ width: '100%' }}
    />
  )

  onPageReadyToCache = pageStatus => {
    const { pageLoaded, pageRendered, getText, currentPage } = this.state
    const newValue = { pageLoaded, pageRendered, getText, ...pageStatus }
    if (newValue.pageLoaded && newValue.pageRendered && newValue.getText) {
      this.cache(currentPage)
      this.setState({ cached: true })
    } else {
      this.setState({ cached: false, ...pageStatus })
    }
  }

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
          renderAnnotations={false}
          onGetTextError={this.onError}
          onLoadSuccess={() => this.onPageReadyToCache({ pageLoaded: true })}
          onRenderSuccess={() => this.onPageReadyToCache({ pageRendered: true })}
          onGetTextSuccess={() => this.onPageReadyToCache({ getText: true })}
        />
      )
      this.pages.set(pageNumber, thePage)
      const { cached } = this.state
      if (cached) {
        return this.renderImage(pageNumber)
      } else {
        return thePage
      }
    } else {
      if(this.pageImgs.has(pageNumber)) {
        return this.renderImage(pageNumber)
      } else {
        return this.pages.get(pageNumber)
      }
    }
  }

  render() {
    const { numPages, currentPage, cached, ready } = this.state;
    const { file } = this.props;
    return (
      <div className="Reader">
        <div className="Reader__container">
          <div className="Reader__container__document">
            <Document
              loading={" "}
              inputRef={ref => this._doc = ref}
              file={{ data: atob(file.split(',')[1])}}
              onLoadSuccess={this.onDocumentLoadSuccess}
              onLoadError={this.onError}
              onSourceError={this.onError}
              options={{
                nativeImageDecoderSupport: 'none'
              }}
            >
              {this.renderPage(currentPage)}
            </Document>
          </div>

          {!cached &&  this.renderLoader()}

          { numPages &&
            <div className="Reader__container__numbers">
              <div className="Reader__container__numbers__content">
                {currentPage} / {numPages}
              </div>
            </div>
          }

          <div className={"Reader__container__navigate"} >
            <div
              className="Reader__container__navigate__arrow"
              style={currentPage === 1 ? { color: 'rgba(255,255,255,0.2)' } : {}}
              onTouchEnd={this.goUp}
            >
              <Up />
            </div>
            <div
              className="Reader__container__navigate__arrow"
              style={currentPage === numPages ? { color: 'rgba(255,255,255,0.2)' } : {}}
              onTouchEnd={this.goDown}
            >
              <Down />
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
