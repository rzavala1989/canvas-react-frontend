// myTheme.js

import { createTheme, lightThemePrimitives } from "baseui/themes";

const ThemePrimitives = {
  ...lightThemePrimitives,
  primary: '#38b2ac',
  primary50: '#e6fffa',
  primary100: '#b2f5ea',
  primary200: '#81e6d9',
  primary300: '#4fd1c5',
  primary400: '#38b2ac',
  primary500: '#319795',
  primary600: '#2c7a7b',
  primary700: '#285e61',
  primaryFontColor: '#000000',
  secondaryFontColor: '#ffffff',

  black: '#000000',
  black50: '#f2f2f2',
  black100: '#e6e6e6',
  black200: '#cccccc',
  black300: '#b3b3b3',
  black400: '#999999',
  black500: '#808080',
  black600: '#666666',
  black700: '#4d4d4d',
  black800: '#333333',
  black900: '#1a1a1a',
};

const theme = createTheme(ThemePrimitives);

export default theme;