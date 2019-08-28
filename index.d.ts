declare module 'rn-pdf-reader-js' {
  import { Component } from "react";
  import { StyleProp, ViewStyle, NavState } from 'react-native';

  interface ISource {
    uri?: string;
    base64?: string;
    headers?: { [key: string]: string };
  }

  interface IProps {
    source: ISource,
    style?: StyleProp<ViewStyle>,
    webviewStyle?: StyleProp<ViewStyle>,
    onLoad?: (event: NavState) => void,
    noLoader?: boolean
  }

  interface IState {
    ready: boolean,
    android: boolean,
    ios: boolean,
    data?: string,
  }

  export function removeFilesAsync(): Promise<void>;

  export default class PdfReader extends Component<IProps, IState> {}
}
