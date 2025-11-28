import AuthButton from "@/components/AuthButton";
import PasswordInput from "@/components/PasswordInput";
import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from "expo-router";
import {
  sendPasswordResetEmail,
  signInWithEmailAndPassword
} from "firebase/auth";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleProp,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";

import { styles } from "./AuthScreen.styles";
import { auth } from "./firebase";

// Set the navigation header title shown in the top bar for this route
// Show a friendly title in the native/header bar instead of the file name
// hide the router/native header and render our own in-screen title
export const options = {
  headerShown: false,
};

export default function AuthScreen() {
  const router = useRouter();
  const emailRef = useRef<TextInput | null>(null);
  const [emailFocused, setEmailFocused] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);

  useEffect(() => {
  }, [router]);

  const validateEmail = (text: string) => {
    setEmail(text);
    const re = /\S+@\S+\.\S+/;
    setEmailError(re.test(text) ? null : "올바른 이메일 형식이 아닙니다");
  };

  const handleSignIn = async () => {
    setError(null);
    if (!email || !password) return setError("이메일과 비밀번호를 입력하세요");
    if (emailError) return setError(emailError);
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.replace("/(tabs)");
    } catch (e: any) {
      setError(e.message || "로그인에 실패했습니다");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email) return Alert.alert("이메일을 입력하세요");
    if (emailError) return Alert.alert("이메일 형식이 올바르지 않습니다");
    try {
      await sendPasswordResetEmail(auth, email);
      Alert.alert("확인", "비밀번호 재설정 이메일을 전송했습니다");
    } catch (e: any) {
      Alert.alert("실패", e.message || "요청을 처리할 수 없습니다");
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.headerBar}>
          <Text style={styles.headerTitle}>로그인</Text>
        </View>
        <View style={styles.header}>
          <Text style={styles.subtitle}>간편하게 로그인하세요</Text>
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <View style={{ width: '100%', marginBottom: 8 }}>
          <Pressable onPress={() => emailRef.current?.focus()} style={{ borderRadius: 10 }} accessibilityRole="button" accessibilityLabel="이메일 입력 상자">
            <View style={[{ flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 10, paddingHorizontal: 10, backgroundColor: Colors.light.background } as StyleProp<ViewStyle>, { borderColor: emailFocused ? Colors.light.tint : Colors.light.icon }]}>
              <Ionicons name="mail-outline" size={20} color="#666" style={{ marginRight: 8 }} />
              <TextInput
                ref={emailRef}
                style={[styles.input, { borderWidth: 0, paddingVertical: 12 }]}
                placeholder="이메일"
                value={email}
                onChangeText={validateEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                textContentType="emailAddress"
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
                accessibilityLabel="이메일 입력"
              />
              {email.length > 0 && (
                <TouchableOpacity onPress={() => { setEmail(''); setEmailError(null); }} style={{ padding: 6 }} accessibilityRole="button">
                  <Ionicons name="close-circle" size={18} color="#666" />
                </TouchableOpacity>
              )}
            </View>
          </Pressable>
        </View>
        {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

        <PasswordInput
          value={password}
          onChangeText={(t: string) => setPassword(t)}
          placeholder="비밀번호"
          containerStyle={styles.passwordInput}
          accessibilityLabel="비밀번호 입력"
        />

        <Text onPress={handleResetPassword} style={styles.linkText} accessibilityRole="button">
          비밀번호를 잊으셨나요?
        </Text>

        <View style={styles.buttonsContainer}>
          <AuthButton title="로그인" onPress={handleSignIn} loading={isLoading} disabled={isLoading} style={styles.buttonSpacing} />
          <AuthButton title="회원가입" onPress={() => router.push("/SignUpScreen")} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
