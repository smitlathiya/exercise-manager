import { TextStyle } from 'react-native';

export const typography = {
  display: { fontSize: 34, fontWeight: '800', letterSpacing: -0.6, lineHeight: 40 } as TextStyle,
  title: { fontSize: 28, fontWeight: '700', letterSpacing: -0.4, lineHeight: 34 } as TextStyle,
  h1: { fontSize: 22, fontWeight: '700', letterSpacing: -0.2, lineHeight: 28 } as TextStyle,
  h2: { fontSize: 18, fontWeight: '700', lineHeight: 24 } as TextStyle,
  h3: { fontSize: 16, fontWeight: '600', lineHeight: 22 } as TextStyle,
  body: { fontSize: 15, fontWeight: '400', lineHeight: 22 } as TextStyle,
  bodyBold: { fontSize: 15, fontWeight: '600', lineHeight: 22 } as TextStyle,
  label: { fontSize: 13, fontWeight: '600', lineHeight: 18 } as TextStyle,
  button: { fontSize: 15, fontWeight: '600', letterSpacing: 0.1, lineHeight: 20 } as TextStyle,
  caption: { fontSize: 12, fontWeight: '500', lineHeight: 16 } as TextStyle,
  footnote: { fontSize: 11, fontWeight: '500', lineHeight: 14 } as TextStyle,
  micro: { fontSize: 10, fontWeight: '600', letterSpacing: 0.5, lineHeight: 14 } as TextStyle,
};

export type TypographyKey = keyof typeof typography;
