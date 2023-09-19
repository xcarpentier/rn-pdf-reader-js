import * as React from 'react';
import { View, ActivityIndicator, Platform, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import * as FileSystem from 'expo-file-system';
const { cacheDirectory, writeAsStringAsync, deleteAsync, getInfoAsync, EncodingType, } = FileSystem;
function viewerHtml(base64, customStyle, withScroll = false, withPinchZoom = false, maximumPinchZoomScale = 5) {
    return `
<!DOCTYPE html>
<html>
  <head>
    <title>PDF reader</title>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, minimum-scale=1.0, initial-scale=1.0, maximum-scale=${withPinchZoom ? `${maximumPinchZoomScale}.0` : '1.0'}, user-scalable=${withPinchZoom ? 'yes' : 'no'}" />
    <script src="https://cdn.jsdelivr.net/npm/pdfjs-dist@2.1.266/build/pdf.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/pdfjs-dist@2.1.266/web/pdf_viewer.min.js"></script>
    <script
      crossorigin
      src="https://unpkg.com/react@16/umd/react.production.min.js"
    ></script>
    <script
      crossorigin
      src="https://unpkg.com/react-dom@16/umd/react-dom.production.min.js"
    ></script>
    <script>
      pdfjsLib.GlobalWorkerOptions.workerSrc =
        'https://cdn.jsdelivr.net/npm/pdfjs-dist@2.1.266/build/pdf.worker.min.js'
    </script>
    <script type="application/javascript">
      try {
        window.CUSTOM_STYLE = JSON.parse('${JSON.stringify((customStyle !== null && customStyle !== void 0 ? customStyle : {}))}');
      } catch (error) {
        window.CUSTOM_STYLE = {}
      }
      try {
        window.WITH_SCROLL = JSON.parse('${JSON.stringify(withScroll)}');
      } catch (error) {
        window.WITH_SCROLL = {}
      }
    </script>
  </head>
  <body>
     <div id="file" data-file="${base64}"></div>
     <div id="react-container"></div>
     <script type="text/javascript" src="bundle.js"></script>
   </body>
</html>
`;
}
const bundleJsPath = `${cacheDirectory}bundle.js`;
const htmlPath = `${cacheDirectory}index.html`;
const pdfPath = `${cacheDirectory}file.pdf`;
async function writeWebViewReaderFileAsync(data, customStyle, withScroll, withPinchZoom, maximumPinchZoomScale) {
    const { exists, md5 } = await getInfoAsync(bundleJsPath, { md5: true });
    const bundleContainer = require('./bundleContainer');
    if (__DEV__ || !exists || bundleContainer.getBundleMd5() !== md5) {
        await writeAsStringAsync(bundleJsPath, bundleContainer.getBundle());
    }
    await writeAsStringAsync(htmlPath, viewerHtml(data, customStyle, withScroll, withPinchZoom, maximumPinchZoomScale));
}
async function writePDFAsync(base64) {
    await writeAsStringAsync(pdfPath, base64.replace('data:application/pdf;base64,', ''), { encoding: EncodingType.Base64 });
}
export async function removeFilesAsync() {
    const { exists: htmlPathExist } = await getInfoAsync(htmlPath);
    if (htmlPathExist) {
        await deleteAsync(htmlPath, { idempotent: true });
    }
    const { exists: pdfPathExist } = await getInfoAsync(pdfPath);
    if (pdfPathExist) {
        await deleteAsync(pdfPath, { idempotent: true });
    }
}
function readAsTextAsync(mediaBlob) {
    return new Promise((resolve, reject) => {
        try {
            const reader = new FileReader();
            reader.onloadend = (_e) => {
                if (typeof reader.result === 'string') {
                    return resolve(reader.result);
                }
                return reject(`Unable to get result of file due to bad type, waiting string and getting ${typeof reader.result}.`);
            };
            reader.readAsDataURL(mediaBlob);
        }
        catch (error) {
            reject(error);
        }
    });
}
async function fetchPdfAsync(source) {
    const mediaBlob = await urlToBlob(source);
    if (mediaBlob) {
        return readAsTextAsync(mediaBlob);
    }
    return undefined;
}
async function urlToBlob(source) {
    if (!source.uri) {
        return undefined;
    }
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.onerror = reject;
        xhr.onreadystatechange = () => {
            if (xhr.readyState === 4) {
                resolve(xhr.response);
            }
        };
        xhr.open('GET', source.uri);
        if (source.headers && Object.keys(source.headers).length > 0) {
            Object.keys(source.headers).forEach((key) => {
                xhr.setRequestHeader(key, source.headers[key]);
            });
        }
        xhr.responseType = 'blob';
        xhr.send();
    });
}
const getGoogleReaderUrl = (url) => `https://docs.google.com/viewer?url=${url}`;
const getGoogleDriveUrl = (url) => `https://drive.google.com/viewerng/viewer?embedded=true&url=${url}`;
const Loader = () => (React.createElement(View, { style: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
    } },
    React.createElement(ActivityIndicator, { size: 'large' })));
class PdfReader extends React.Component {
    constructor() {
        super(...arguments);
        this.state = {
            renderType: undefined,
            ready: false,
            data: undefined,
            renderedOnce: false,
        };
        this.validate = () => {
            const { onError: propOnError, source } = this.props;
            const { renderType } = this.state;
            const onError = propOnError !== undefined ? propOnError : console.error;
            if (!renderType || !source) {
                onError('source is undefined');
            }
            else if ((renderType === 'DIRECT_URL' ||
                renderType === 'GOOGLE_READER' ||
                renderType === 'GOOGLE_DRIVE_VIEWER' ||
                renderType === 'URL_TO_BASE64') &&
                (!source.uri ||
                    !(source.uri.startsWith('http') ||
                        source.uri.startsWith('file') ||
                        source.uri.startsWith('content')))) {
                onError(`source.uri is undefined or not started with http, file or content source.uri = ${source.uri}`);
            }
            else if ((renderType === 'BASE64_TO_LOCAL_PDF' ||
                renderType === 'DIRECT_BASE64') &&
                (!source.base64 ||
                    !source.base64.startsWith('data:application/pdf;base64,'))) {
                onError('Base64 is not correct (ie. start with data:application/pdf;base64,)');
            }
        };
        this.init = async () => {
            try {
                const { source, customStyle, withScroll, withPinchZoom, maximumPinchZoomScale, } = this.props;
                const { renderType } = this.state;
                switch (renderType) {
                    case 'GOOGLE_DRIVE_VIEWER': {
                        break;
                    }
                    case 'URL_TO_BASE64': {
                        const data = await fetchPdfAsync(source);
                        await writeWebViewReaderFileAsync(data, customStyle, withScroll, withPinchZoom, maximumPinchZoomScale);
                        break;
                    }
                    case 'DIRECT_BASE64': {
                        await writeWebViewReaderFileAsync(source.base64, customStyle, withScroll, withPinchZoom, maximumPinchZoomScale);
                        break;
                    }
                    case 'BASE64_TO_LOCAL_PDF': {
                        await writePDFAsync(source.base64);
                        break;
                    }
                    default:
                        break;
                }
                this.setState({ ready: true });
            }
            catch (error) {
                alert(`Sorry, an error occurred. ${error.message}`);
                console.error(error);
            }
        };
        this.getRenderType = () => {
            const { useGoogleReader, useGoogleDriveViewer, source: { uri, base64 }, } = this.props;
            if (useGoogleReader) {
                return 'GOOGLE_READER';
            }
            if (useGoogleDriveViewer) {
                return 'GOOGLE_DRIVE_VIEWER';
            }
            if (Platform.OS === 'ios') {
                if (uri !== undefined) {
                    return 'DIRECT_URL';
                }
                if (base64 !== undefined) {
                    return 'BASE64_TO_LOCAL_PDF';
                }
            }
            if (base64 !== undefined) {
                return 'DIRECT_BASE64';
            }
            if (uri !== undefined) {
                return 'URL_TO_BASE64';
            }
            return undefined;
        };
        this.getWebviewSource = () => {
            const { renderType } = this.state;
            const { source: { uri = '', headers }, onError, } = this.props;
            switch (renderType) {
                case 'GOOGLE_READER':
                    return { uri: getGoogleReaderUrl(uri) };
                case 'GOOGLE_DRIVE_VIEWER':
                    return { uri: getGoogleDriveUrl(uri) };
                case 'DIRECT_BASE64':
                case 'URL_TO_BASE64':
                    return { uri: htmlPath };
                case 'DIRECT_URL':
                    return { uri: uri, headers };
                case 'BASE64_TO_LOCAL_PDF':
                    return { uri: pdfPath };
                default: {
                    onError('Unknown RenderType');
                    return undefined;
                }
            }
        };
    }
    componentDidMount() {
        this.setState({ renderType: this.getRenderType() }, () => {
            console.debug(this.state.renderType);
            this.validate();
            this.init();
        });
    }
    componentDidUpdate(prevProps) {
        if (prevProps.source.uri !== this.props.source.uri ||
            prevProps.source.base64 !== this.props.source.base64) {
            this.setState({ ready: false, renderType: this.getRenderType() });
            this.validate();
            this.init();
        }
    }
    componentWillUnmount() {
        const { renderType } = this.state;
        if (renderType === 'DIRECT_BASE64' ||
            renderType === 'URL_TO_BASE64' ||
            renderType === 'BASE64_TO_LOCAL_PDF') {
            try {
                removeFilesAsync();
            }
            catch (error) {
                alert(`Error on removing file. ${error.message}`);
                console.error(error);
            }
        }
    }
    render() {
        const { ready, renderedOnce } = this.state;
        const { style: containerStyle, webviewStyle, onLoad, noLoader, onLoadEnd, onError, webviewProps, } = this.props;
        const originWhitelist = [
            'http://*',
            'https://*',
            'file://*',
            'data:*',
            'content:*',
        ];
        const style = [styles.webview, webviewStyle];
        const isAndroid = Platform.OS === 'android';
        if (ready) {
            const source = this.getWebviewSource();
            return (React.createElement(View, { style: [styles.container, containerStyle] },
                React.createElement(WebView, Object.assign({}, {
                    originWhitelist,
                    onLoad: (event) => {
                        this.setState({ renderedOnce: true });
                        if (onLoad) {
                            onLoad(event);
                        }
                    },
                    onLoadEnd,
                    onError,
                    onHttpError: onError,
                    style,
                    source: renderedOnce || !isAndroid ? source : { html: '' },
                }, { allowFileAccess: isAndroid, allowFileAccessFromFileURLs: isAndroid, allowUniversalAccessFromFileURLs: isAndroid, scalesPageToFit: Platform.select({ android: false }), mixedContentMode: isAndroid ? 'always' : undefined, sharedCookiesEnabled: false, startInLoadingState: !noLoader, renderLoading: () => (noLoader ? React.createElement(View, null) : React.createElement(Loader, null)) }, webviewProps))));
        }
        return !noLoader && !ready && React.createElement(Loader, null);
    }
}
PdfReader.defaultProps = {
    withScroll: false,
    noLoader: false,
};
const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    webview: {
        flex: 1,
    },
});
export default PdfReader;
