import AuthButton from "@/components/AuthButton";
import PasswordInput from "@/components/PasswordInput";
import { useRouter } from "expo-router";
import {
    onAuthStateChanged,
    sendPasswordResetEmail,
    signInWithEmailAndPassword
} from "firebase/auth";
import { useEffect, useState } from "react";
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TextInput,
    View,
} from "react-native";

import { styles } from "./AuthScreen.styles";
import { auth } from "./firebase";

export default function AuthScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.replace("/(tabs)"); // 로그인 되어있으면 탭 화면으로 이동
      }
    });
    return unsubscribe;
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
        <View style={styles.header}>
          <Text style={styles.logoText}>Community App</Text>
          <Text style={styles.subtitle}>간편하게 로그인하세요</Text>
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <TextInput
          style={styles.input}
          placeholder="이메일"
          value={email}
          onChangeText={validateEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          textContentType="emailAddress"
        />
        {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

        <PasswordInput
          value={password}
          onChangeText={(t: string) => setPassword(t)}
          placeholder="비밀번호"
          style={styles.passwordInput}
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
