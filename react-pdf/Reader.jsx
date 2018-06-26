import React, { Component } from 'react';
import { render } from 'react-dom';
import { Document, Page, setOptions } from 'react-pdf';
import raf, { cancel } from 'raf';
import PropTypes from 'prop-types';

import Left from './components/Left';
import Right from './components/Right';
import Minus from './components/Minus';
import Plus from './components/Plus';

import './Reader.less';

const ReactContainer = document.querySelector('#react-container'); // eslint-disable-line no-undef

setOptions({
  workerSrc: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.0.305/pdf.worker.min.js',
  disableWorker: false,
  cMapUrl: 'https://github.com/mozilla/pdfjs-dist/raw/master/cmaps/',
  cMapPacked: true,
});

class Reader extends Component {
  state = {
    numPages: null,
    currentPage: 1,
    scale: 0.75,
  }

  pageRefs = new Map()

  MAX_SCALE = 2;

  __zoomEvent = false;
  onDocumentLoadSuccess = ({ numPages }) => {
    this.setState({ numPages });
  }

  onError = (error) => window.alert(`Error while loading document! \n${error.message}`); // eslint-disable-line no-undef, no-alert

  zoomOut = (event) => {
    event.preventDefault();
    if (!this.__zoomEvent) {
      raf(this.zOut);
    }
  }

  zoomIn = (event) => {
    event.preventDefault();
    if (!this.__zoomEvent) { // eslint-disable-line no-underscore-dangle
      raf(this.zIn);
    }
  }

  zOut = () => {
    console.log(this.state.scale);
    if (this.state.scale >= 0.75) {
      this.__zoomEvent = true;
      this.setState((previousState) => ({
        scale: previousState.scale - 0.25,
      }));
    }
  }

  zIn = () => {
    console.log(this.state.scale);
    if (this.state.scale <= this.MAX_SCALE - 0.25) {
      this.__zoomEvent = true;
      this.setState((previousState) => ({
        scale: previousState.scale + 0.25,
      }));
    }
  }

  up = () => {
    const { currentPage } = this.state;
    if (currentPage > 1) {
      const target = currentPage - 1;
      this.setState({ currentPage: target });
    }
    cancel(this.up);
  }


  down = () => {
    const { currentPage, numPages } = this.state;
    if (currentPage < numPages) {
      const target = currentPage + 1;
      this.setState({ currentPage: target });
    }
    cancel(this.down);
  }

  goUp = (event) => {
    event.preventDefault();
    raf(this.up);
  }

  goDown = (event) => {
    event.preventDefault();
    raf(this.down);
  }

  renderPage = (pageNumber) => (
    <Page
      loading=" "
      inputRef={(ref) => ref && this.pageRefs.set(pageNumber, ref)}
      key={`page_${pageNumber}`}
      pageNumber={pageNumber}
      onLoadError={this.onError}
      onRenderError={this.onError}
      onGetTextError={this.onError}
      onRenderSuccess={() => { (this.__zoomEvent = false); }}
      scale={this.state.scale}
    />
  )

  render() {
    const {
      numPages, currentPage,
    } = this.state;
    const { file } = this.props;
    return (
      <div className="Reader">
        <div className="Reader__container">
          <div className="Reader__container__document">
            <Document
              loading=" "
              inputRef={(ref) => { (this._doc = ref); }}
              file={{ data: atob(file.split(',')[1]) }} // eslint-disable-line no-undef
              onLoadSuccess={this.onDocumentLoadSuccess}
              onLoadError={this.onError}
              onSourceError={this.onError}
              options={{
                nativeImageDecoderSupport: 'none',
              }}
            >
              {this.renderPage(currentPage)}
            </Document>
          </div>

          { numPages &&
            <div className="Reader__container__numbers">
              <div className="Reader__container__numbers__content">
                {currentPage} / {numPages}
              </div>
            </div>
          }

          <div className="Reader__container__zoom_container">
            <div // eslint-disable-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events
              className="Reader__container__zoom_container__button"
              onTouchEnd={this.zoomIn}
              onClick={this.zoomIn}
            >
              <Plus />
            </div>
            <div // eslint-disable-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events
              className="Reader__container__zoom_container__button"
              onTouchEnd={this.zoomOut}
              onClick={this.zoomOut}
            >
              <Minus />
            </div>
          </div>
          <div className="Reader__container__navigate">
            <div // eslint-disable-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events
              className="Reader__container__navigate__arrow"
              style={currentPage === 1 ? { color: 'rgba(255,255,255,0.1)' } : {}}
              onTouchEnd={this.goUp}
              onClick={this.goUp}
            >
              <Left />
            </div>
            <div // eslint-disable-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events
              className="Reader__container__navigate__arrow"
              style={currentPage === numPages ? { color: 'rgba(255,255,255,0.1)' } : {}}
              onTouchEnd={this.goDown}
              onClick={this.goDown}
            >
              <Right />
            </div>
          </div>
        </div>
      </div>
    );
  }
}
Reader.propTypes = {
  file: PropTypes.string.isRequired,
};

const tagData = document.querySelector('#file'); // eslint-disable-line no-undef
const file = tagData.getAttribute('data-file');
render(<Reader file={file} />, ReactContainer);
