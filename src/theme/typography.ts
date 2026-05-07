import { TextStyle } from 'react-native';

export const typography = {
  display: { fontSize: 32, fontWeight: '800', letterSpacing: -0.5 } as TextStyle,
  h1: { fontSize: 24, fontWeight: '700', letterSpacing: -0.3 } as TextStyle,
  h2: { fontSize: 20, fontWeight: '700' } as TextStyle,
  h3: { fontSize: 17, fontWeight: '600' } as TextStyle,
  body: { fontSize: 15, fontWeight: '400' } as TextStyle,
  bodyBold: { fontSize: 15, fontWeight: '600' } as TextStyle,
  caption: { fontSize: 12, fontWeight: '500' } as TextStyle,
  micro: { fontSize: 10, fontWeight: '600', letterSpacing: 0.5 } as TextStyle,
};

export type TypographyKey = keyof typeof typography;
