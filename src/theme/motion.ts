import { Easing } from 'react-native-reanimated';

export const motion = {
  duration: {
    instant: 80,
    fast: 140,
    base: 200,
    slow: 320,
    deliberate: 480,
  },
  easing: {
    standard: Easing.bezier(0.2, 0, 0, 1),
    decelerate: Easing.bezier(0, 0, 0, 1),
    accelerate: Easing.bezier(0.3, 0, 1, 1),
    emphasized: Easing.bezier(0.2, 0, 0, 1.2),
  },
  pressScale: 0.97,
};
