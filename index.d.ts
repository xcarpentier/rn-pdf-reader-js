declare module 'rn-pdf-reader-js' {
  import { Component } from "react";
  import { StyleProp, ViewStyle, NavState } from 'react-native';

  interface IProps {
    source: {
      uri?: string,
      base64?: string
    },
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
