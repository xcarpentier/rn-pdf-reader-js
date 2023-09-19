import * as React from 'react';
import * as CSS from 'csstype';
import { View } from 'react-native';
import { WebView } from 'react-native-webview';
import { WebViewErrorEvent, WebViewNavigationEvent, WebViewHttpErrorEvent } from 'react-native-webview/lib/WebViewTypes';
export declare type RenderType = 'DIRECT_URL' | 'DIRECT_BASE64' | 'BASE64_TO_LOCAL_PDF' | 'URL_TO_BASE64' | 'GOOGLE_READER' | 'GOOGLE_DRIVE_VIEWER';
export interface CustomStyle {
    readerContainer?: CSS.Properties<any>;
    readerContainerDocument?: CSS.Properties<any>;
    readerContainerNumbers?: CSS.Properties<any>;
    readerContainerNumbersContent?: CSS.Properties<any>;
    readerContainerZoomContainer?: CSS.Properties<any>;
    readerContainerZoomContainerButton?: CSS.Properties<any>;
    readerContainerNavigate?: CSS.Properties<any>;
    readerContainerNavigateArrow?: CSS.Properties<any>;
}
export interface Source {
    uri?: string;
    base64?: string;
    headers?: {
        [key: string]: string;
    };
}
export interface Props {
    source: Source;
    style?: View['props']['style'];
    webviewStyle?: WebView['props']['style'];
    webviewProps?: WebView['props'];
    noLoader?: boolean;
    customStyle?: CustomStyle;
    useGoogleReader?: boolean;
    useGoogleDriveViewer?: boolean;
    withScroll?: boolean;
    withPinchZoom?: boolean;
    maximumPinchZoomScale?: number;
    onLoad?(event: WebViewNavigationEvent): void;
    onLoadEnd?(event: WebViewNavigationEvent | WebViewErrorEvent): void;
    onError?(event: WebViewErrorEvent | WebViewHttpErrorEvent | string): void;
}
interface State {
    renderType?: RenderType;
    ready: boolean;
    data?: string;
    renderedOnce: boolean;
}
export declare function removeFilesAsync(): Promise<void>;
declare class PdfReader extends React.Component<Props, State> {
    static defaultProps: {
        withScroll: boolean;
        noLoader: boolean;
    };
    state: {
        renderType: undefined;
        ready: boolean;
        data: undefined;
        renderedOnce: boolean;
    };
    validate: () => void;
    init: () => Promise<void>;
    getRenderType: () => "DIRECT_URL" | "DIRECT_BASE64" | "BASE64_TO_LOCAL_PDF" | "URL_TO_BASE64" | "GOOGLE_READER" | "GOOGLE_DRIVE_VIEWER" | undefined;
    getWebviewSource: () => import("react-native-webview/lib/WebViewTypes").WebViewSourceUri | import("react-native-webview/lib/WebViewTypes").WebViewSourceHtml | undefined;
    componentDidMount(): void;
    componentDidUpdate(prevProps: Props): void;
    componentWillUnmount(): void;
    render(): false | JSX.Element;
}
export default PdfReader;
