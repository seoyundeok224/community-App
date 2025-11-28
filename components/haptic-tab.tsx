import { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { PlatformPressable } from '@react-navigation/elements';
import * as Haptics from 'expo-haptics';
import React, { useRef } from 'react';
import { Animated, Platform, StyleSheet, View } from 'react-native';

type HapticTabProps = BottomTabBarButtonProps & { position?: 'left' | 'right' };

export function HapticTab({ position, ...props }: HapticTabProps) {
  // position the button absolutely inside the tab bar when requested
  const posStyle = position === 'left' ? styles.left : position === 'right' ? styles.right : undefined;
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = (ev: any) => {
    Animated.spring(scale, { toValue: 0.92, useNativeDriver: true, speed: 20, bounciness: 6 }).start();
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {}
    props.onPressIn?.(ev as any);
  };

  const handlePressOut = (ev: any) => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 20, bounciness: 6 }).start();
    props.onPressOut?.(ev as any);
  };

  return (
    <View style={posStyle} pointerEvents="box-none">
      <Animated.View style={{ transform: [{ scale }] }}>
        <PlatformPressable
          {...(props as any)}
          onPress={(ev) => { props.onPress?.(ev as any); }}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  left: {
    position: 'absolute',
    left: 72,
    bottom: Platform.OS === 'ios' ? 24 : 12,
    top: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  right: {
    position: 'absolute',
    right: 72,
    bottom: Platform.OS === 'ios' ? 24 : 12,
    top: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
