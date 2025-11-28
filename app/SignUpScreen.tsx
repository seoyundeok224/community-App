import { useRouter } from "expo-router";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, View } from "react-native";

import AuthButton from "@/components/AuthButton";
import PasswordInput from "@/components/PasswordInput";
import { styles } from "./AuthScreen.styles";
import { auth } from "./firebase";

export default function SignUpScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);

  const validateEmail = (text: string) => {
    setEmail(text);
    const re = /\S+@\S+\.\S+/;
    setEmailError(re.test(text) ? null : "올바른 이메일 형식이 아닙니다");
  };

  const handleSignUp = async () => {
    setError(null);
    if (!email || !password) return setError("이메일과 비밀번호를 입력하세요");
    if (emailError) return setError(emailError);
    if (password.length < 6) return setError("비밀번호는 6자리 이상이어야 합니다");
    setIsLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      router.replace("/auth");
    } catch (e: any) {
      setError(e.message || "회원가입에 실패했습니다");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.logoText}>Community App</Text>
          <Text style={styles.subtitle}>회원가입하고 시작하세요</Text>
        </View>

        {error && <Text style={styles.errorText}>{error}</Text>}

        <TextInput
          style={styles.input}
          placeholder="이메일"
          value={email}
          onChangeText={validateEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          textContentType="emailAddress"
        />
        {emailError && <Text style={styles.errorText}>{emailError}</Text>}

        <PasswordInput value={password} onChangeText={setPassword} placeholder="비밀번호" style={styles.passwordInput} />

        <View style={styles.buttonsContainer}>
          <AuthButton title="회원가입" onPress={handleSignUp} loading={isLoading} disabled={isLoading} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
