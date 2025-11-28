import { Colors } from '@/constants/theme';
import React from "react";
import { ActivityIndicator, Animated, StyleProp, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from "react-native";

type Props = {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

export default function AuthButton({ title, onPress, loading, disabled, style }: Props) {
  const pressed = React.useRef(new Animated.Value(1)).current;
  const [isPressed, setIsPressed] = React.useState(false);

  const handlePressIn = () => {
    setIsPressed(true);
    Animated.spring(pressed, { toValue: 0.98, useNativeDriver: true }).start();
  };
  const handlePressOut = () => {
    setIsPressed(false);
    Animated.spring(pressed, { toValue: 1, useNativeDriver: true }).start();
  };

  return (
    <Animated.View style={[{ transform: [{ scale: pressed }] }, style]}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        accessibilityRole="button"
        accessibilityState={{ disabled: !!(disabled || loading) }}
      >
        <View style={[styles.button, disabled ? styles.disabled : null, { backgroundColor: disabled ? '#9fb3d6' : Colors.light.tint }]}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={[styles.text, isPressed ? styles.textPressed : null]}>{title}</Text>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    width: "100%",
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  text: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  textPressed: {
    color: '#000',
  },
  disabled: {
    opacity: 0.7,
  },
});
