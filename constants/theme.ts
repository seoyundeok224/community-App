// constants/theme.ts
import { Platform } from 'react-native';

const tintColorLight = '#0a7ea4';
const tintColorDark = '#4fc3f7';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#ffffff',
    border: '#dcdcdc',
    placeholder: '#9ba1a6',
    icon: '#687076',
    tint: tintColorLight,
    danger: '#e53935',
    success: '#2ecc71',
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    border: '#3a3b3d',
    placeholder: '#a5a5a5',
    icon: '#9BA1A6',
    tint: tintColorDark,
    danger: '#ef5350',
    success: '#81c784',
  },
};

export const Spacing = {
  xs: 4,
  s: 8,
  m: 16,
  l: 24,
  xl: 32,
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  android: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  }
});
