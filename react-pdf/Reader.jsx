import React, { Component } from 'react'
import { render } from 'react-dom'
import { Page, setOptions, Document } from 'react-pdf'
import raf, { cancel } from 'raf'
import Plus from './components/Plus'
import Minus from './components/Minus'
import Down from './components/down'
import Up from './components/up'
import './Reader.less'

const ReactContainer = document.querySelector('#react-container')

setOptions({
  workerSrc:
    'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.0.305/pdf.worker.min.js',
  disableWorker: false,
  cMapUrl: 'https://github.com/mozilla/pdfjs-dist/raw/master/cmaps/',
  cMapPacked: true,
})

class Reader extends Component {
  state = {
    numPages: null,
    currentPage: 1,
    ready: true,
    pageLoaded: false,
    pageRendered: false,
    getText: false,
    scale: 0.75,
  }

  MAX_SCALE = 2
  __zoomEvent = false

  pageRefs = new Map()

  onDocumentLoadSuccess = ({ numPages }) => {
    this.setState({ numPages })
  }

  onError = error =>
    window.alert('Error while loading document! \n' + error.message)

  cache = pageKey => {
    if (!this.pageImgs.has(pageKey)) {
      this.pageImgs.set(
        pageKey,
        this.pageRefs.get(pageKey).children[0].toDataURL('image/png'),
      )
    }
  }

  zoomOut = event => {
    event.preventDefault()
    if (!this.__zoomEvent) {
      raf(this.zOut)
    }
  }

  zoomIn = event => {
    event.preventDefault() // this too
    if (!this.__zoomEvent) {
      raf(this.zIn)
    }
  }

  zOut = () => {
    console.log(this.state.scale)
    if (this.state.scale >= 0.75) {
      // min scale out is 0.5 and defaults @ 0.75
      this.__zoomEvent = true
      this.setState(previousState => ({
        scale: previousState.scale - 0.25,
      }))
    }
  }

  zIn = () => {
    console.log(this.state.scale)
    if (this.state.scale <= this.MAX_SCALE - 0.25) {
      this.__zoomEvent = true
      this.setState(previousState => ({
        scale: previousState.scale + 0.25,
      }))
    }
  }

  up = () => {
    const { currentPage } = this.state
    if (currentPage > 1) {
      const target = currentPage - 1
      this.setState({ currentPage: target })
      if (!this.pageImgs.has(target)) {
        this.setState({
          pageLoaded: false,
          pageRendered: false,
          getText: false,
        })
      }
    }
    cancel(this.up)
  }

  down = () => {
    const { currentPage, numPages } = this.state
    if (currentPage < numPages) {
      const target = currentPage + 1
      this.setState({ currentPage: target })
      if (!this.pageImgs.has(target)) {
        this.setState({
          pageLoaded: false,
          pageRendered: false,
          getText: false,
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
    <div
      style={{
        width: window.innerWidth,
        height: window.innerHeight,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <p style={{ color: '#fff' }}>Loading...</p>
    </div>
  )

  renderImage = pageNumber => (
    <img src={this.pageImgs.get(pageNumber)} style={{ width: '100%' }} />
  )

  onPageReadyToCache = pageStatus => {
    this.__zoomEvent = false
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
    return (
      <Page
        loading={' '}
        inputRef={ref => ref && this.pageRefs.set(pageNumber, ref)}
        key={`page_${pageNumber}`}
        pageNumber={pageNumber}
        onLoadError={this.onError}
        onRenderError={this.onError}
        renderAnnotations={false}
        onGetTextError={this.onError}
        onRenderSuccess={() => this.onPageReadyToCache({ pageRendered: true })}
        onGetTextSuccess={() => this.onPageReadyToCache({ getText: true })}
        scale={this.state.scale}
      />
    )
  }

  render() {
    const { numPages, currentPage, cached, ready } = this.state
    const { file } = this.props
    return (
      <div className="Reader">
        <div className="Reader__container">
          <div className="Reader__container__document">
            <Document
              loading={' '}
              inputRef={ref => (this._doc = ref)}
              file={file}
              onLoadSuccess={this.onDocumentLoadSuccess}
              onLoadError={this.onError}
              onSourceError={this.onError}
            >
              {this.renderPage(currentPage)}
            </Document>
          </div>

          {!cached && this.renderLoader()}

          {numPages && (
            <div className="Reader__container__numbers">
              <div className="Reader__container__numbers__content">
                {currentPage} / {numPages}
              </div>
            </div>
          )}

          <div className="Reader__container__zoom_container">
            <div
              className="Reader__container__zoom_container__button"
              onClick={this.zoomIn}
            >
              <Plus />
            </div>
            <div
              className="Reader__container__zoom_container__button"
              onClick={this.zoomOut}
            >
              <Minus />
            </div>
          </div>

          <div className={'Reader__container__navigate'}>
            <div
              className="Reader__container__navigate__arrow"
              style={
                currentPage === 1 ? { color: 'rgba(255,255,255,0.2)' } : {}
              }
              onClick={this.goUp}
            >
              <Up />
            </div>
            <div
              className="Reader__container__navigate__arrow"
              style={
                currentPage === numPages
                  ? { color: 'rgba(255,255,255,0.2)' }
                  : {}
              }
              onClick={this.goDown}
            >
              <Down />
            </div>
          </div>
        </div>
      </div>
    )
  }
}

const tagData = document.querySelector('#file')
const file = tagData.getAttribute('data-file')
render(<Reader file={file} />, ReactContainer)
