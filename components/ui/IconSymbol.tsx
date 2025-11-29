import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { useColorScheme as useDeviceColorScheme } from 'react-native';

import { Colors } from '@/constants/theme';

type IconSymbolProps = {
  name: string; // string으로 안전하게 처리
  size?: number;
  color?: string;
};

export const IconSymbol: React.FC<IconSymbolProps> = ({ name, size = 24, color }) => {
  const colorScheme = useDeviceColorScheme() || 'light';
  return (
    <Ionicons
      name={name as any} // Ionicons가 string 기반이라 타입 안전하게 처리
      size={size}
      color={color ?? Colors[colorScheme].text}
    />
  );
};
