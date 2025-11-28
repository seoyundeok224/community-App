import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { StyleProp, StyleSheet, TextInput, TextInputProps, TextStyle, TouchableOpacity, View, ViewStyle } from "react-native";

type Props = Omit<TextInputProps, 'style' | 'onChange'> & {
  value: string;
  onChangeText?: (text: string) => void;
  style?: StyleProp<TextStyle>; // apply to TextInput
  containerStyle?: StyleProp<ViewStyle>;
  iconColor?: string;
};

export default function PasswordInput({ value, onChangeText, placeholder, style, containerStyle, iconColor = "#333", ...rest }: Props) {
  const [visible, setVisible] = useState(false);

  return (
    <View style={[styles.container, containerStyle]}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        secureTextEntry={!visible}
        style={[styles.input, style]}
        autoCapitalize="none"
        {...rest}
      />
      <TouchableOpacity
        onPress={() => setVisible(v => !v)}
        style={styles.iconButton}
        accessibilityRole="button"
      >
        <Ionicons name={visible ? "eye" : "eye-off"} size={20} color={iconColor} />
      </TouchableOpacity>
    </View>
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
});
