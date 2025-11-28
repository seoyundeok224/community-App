import { Colors } from '@/constants/theme';
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import { Animated, StyleProp, StyleSheet, Text, TextInput, TextInputProps, TextStyle, TouchableOpacity, TouchableWithoutFeedback, View, ViewStyle } from "react-native";

type Props = Omit<TextInputProps, 'style' | 'onChange'> & {
  value: string;
  onChangeText?: (text: string) => void;
  style?: StyleProp<TextStyle>; // apply to TextInput
  containerStyle?: StyleProp<ViewStyle>;
  iconColor?: string;
};

export default function PasswordInput({ value, onChangeText, placeholder, style, containerStyle, iconColor = "#333", ...rest }: Props) {
  const [visible, setVisible] = useState(false);
  const [focused, setFocused] = useState(false);

  const calcStrength = (pw: string) => {
    if (!pw) return { score: 0, label: '' };
    let score = 0;
    if (pw.length >= 6) score += 1;
    if (/[A-Z]/.test(pw)) score += 1;
    if (/[0-9]/.test(pw)) score += 1;
    if (/[^A-Za-z0-9]/.test(pw)) score += 1;
    const label = score <= 1 ? '약함' : score === 2 ? '보통' : score === 3 ? '강함' : '매우 강함';
    return { score, label };
  };

  const inputRef = useRef<TextInput | null>(null);
  const strengthAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const score = calcStrength(value).score;
    const width = (score / 4) * 40; // max 40
    Animated.timing(strengthAnim, { toValue: width, duration: 250, useNativeDriver: false }).start();
  }, [value, strengthAnim]);

  return (
    <TouchableWithoutFeedback onPress={() => inputRef.current?.focus()}>
      <View style={[styles.container, containerStyle, focused ? styles.focused : null]}>
        <TextInput
          ref={inputRef}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          secureTextEntry={!visible}
          style={[styles.input, style]}
          autoCapitalize="none"
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...rest}
        />
      {value.length > 0 && (
        <TouchableOpacity onPress={() => onChangeText?.('')} style={styles.clearButton} accessibilityRole="button">
          <Ionicons name="close-circle" size={18} color="#666" />
        </TouchableOpacity>
      )}
        <TouchableOpacity
          onPress={() => setVisible(v => !v)}
          style={styles.iconButton}
          accessibilityRole="button"
        >
          <Ionicons name={visible ? "eye" : "eye-off"} size={20} color={iconColor} />
        </TouchableOpacity>
        <View style={styles.strengthRow} pointerEvents="none">
          <Animated.View style={[
            styles.strengthBar,
            { width: strengthAnim, backgroundColor: [
              Colors.light.icon,
              '#f39c12',
              '#f1c40f',
              '#2ecc71',
              Colors.light.tint,
            ][calcStrength(value).score] }
          ]} />
          <Text style={styles.strengthText}>{calcStrength(value).label}</Text>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#aaa",
    borderRadius: 10,
    paddingHorizontal: 10,
    backgroundColor: "#fff",
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    paddingRight: 8,
    fontSize: 16,
    height: 50,
  },
  iconButton: {
    padding: 6,
  },
  clearButton: {
    padding: 6,
    marginRight: 4,
  },
  focused: {
    borderColor: '#4c9ef5',
    shadowColor: '#4c9ef5',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  strengthRow: {
    position: 'absolute',
    right: 10,
    bottom: -18,
    alignItems: 'center',
  },
  strengthBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    marginBottom: 2,
  },
  strengthText: {
    fontSize: 10,
    color: '#666',
  },
});
