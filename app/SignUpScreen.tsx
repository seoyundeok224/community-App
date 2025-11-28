import { useRouter } from "expo-router";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useRef, useState } from "react";
import { Alert, Animated, Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";

import AuthButton from "@/components/AuthButton";
import PasswordInput from "@/components/PasswordInput";
import { Ionicons } from '@expo/vector-icons';
import { styles } from "./AuthScreen.styles";
import { auth } from "./firebase";

export const options = {
  headerShown: false,
};

export default function SignUpScreen() {
  const router = useRouter();
  const emailRef = useRef<TextInput | null>(null);
  const [emailFocused, setEmailFocused] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [agreed, setAgreed] = useState(false);
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [useBiometrics, setUseBiometrics] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const successOpacity = useRef(new Animated.Value(0)).current;

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
    if (password !== confirmPassword) return setError("비밀번호가 일치하지 않습니다");
    if (!agreed) return setError("약관에 동의해야 합니다");
    setIsLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      // show success overlay then navigate
      setShowSuccess(true);
      Animated.timing(successOpacity, { toValue: 1, duration: 300, useNativeDriver: true }).start(() => {
        setTimeout(() => {
          Animated.timing(successOpacity, { toValue: 0, duration: 300, useNativeDriver: true }).start(() => {
            setShowSuccess(false);
            router.replace("/auth");
          });
        }, 900);
      });
    } catch (e: any) {
      setError(e.message || "회원가입에 실패했습니다");
    } finally {
      setIsLoading(false);
    }
  };

  const pickAvatar = async () => {
    try {
      // dynamic import to avoid hard dependency when package isn't installed
      // @ts-ignore -- optional dependency, import at runtime if present
      // eslint-disable-next-line import/no-unresolved
      const ImagePicker = await import('expo-image-picker');
      const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.6, allowsEditing: true, aspect: [1,1] });
      if (!res.cancelled) setAvatarUri((res as any).uri ?? null);
    } catch {
      Alert.alert('패키지 필요', '프로필 사진 기능을 사용하려면 expo-image-picker를 설치하세요.\n`expo install expo-image-picker`');
    }
  };

  const handleSocialSignUp = async (provider: string) => {
    Alert.alert('소셜 로그인', `${provider} 로그인은 설정이 필요합니다. README의 가이드를 참고하세요.`);
  };

  const toggleBiometrics = async () => {
    try {
      // @ts-ignore -- optional dependency, import at runtime if present
      // eslint-disable-next-line import/no-unresolved
      const LocalAuth = await import('expo-local-authentication');
      const has = await LocalAuth.hasHardwareAsync();
      if (!has) return Alert.alert('사용 불가', '이 기기는 생체 인증을 지원하지 않습니다.');
      const enrolled = await LocalAuth.isEnrolledAsync();
      if (!enrolled) return Alert.alert('설정 필요', '기기에 생체 인증이 설정되어 있지 않습니다.');
      setUseBiometrics(u => !u);
    } catch {
      Alert.alert('패키지 필요', '바이오 인증을 사용하려면 expo-local-authentication를 설치하세요.\n`expo install expo-local-authentication`');
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.headerBar}>
          <Text style={styles.headerTitle}>회원가입</Text>
        </View>
        <View style={styles.header}>
          <Text style={styles.subtitle}>회원가입하고 시작하세요</Text>
        </View>

        {error && <Text style={styles.errorText}>{error}</Text>}

        <View style={{ alignItems: 'center', marginBottom: 12 }}>
          {avatarUri ? (
            <Image source={{ uri: avatarUri }} style={{ width: 96, height: 96, borderRadius: 48, marginBottom: 8 }} />
          ) : (
            <View style={{ width: 96, height: 96, borderRadius: 48, backgroundColor: '#eee', marginBottom: 8, justifyContent: 'center', alignItems: 'center' }}>
              <Ionicons name="person" size={36} color="#999" />
            </View>
          )}
          <TouchableOpacity onPress={pickAvatar} accessibilityRole="button">
            <Text style={[styles.linkText, { textAlign: 'center' }]}>프로필 사진 추가</Text>
          </TouchableOpacity>
        </View>

        <View style={{ width: '100%', marginBottom: 8 }}>
          <Pressable onPress={() => emailRef.current?.focus()} style={{ borderRadius: 10 }} accessibilityRole="button" accessibilityLabel="이메일 입력 상자">
            <View style={[{ flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 10, paddingHorizontal: 10, backgroundColor: '#fff' }, { borderColor: emailFocused ? '#0a7ea4' : '#aaa' }]}> 
              <Ionicons name="mail-outline" size={20} color="#666" style={{ marginRight: 8 }} />
              <TextInput
                ref={emailRef}
                style={[styles.input, { borderWidth: 0, paddingVertical: 12 }]}
                placeholder="이메일"
                value={email}
                onChangeText={validateEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                textContentType="emailAddress"
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
                accessibilityLabel="이메일 입력"
              />
            </View>
          </Pressable>
        </View>
        {emailError && <Text style={styles.errorText}>{emailError}</Text>}

        <PasswordInput value={password} onChangeText={setPassword} placeholder="비밀번호" containerStyle={styles.passwordInput} accessibilityLabel="비밀번호 입력" />

        <PasswordInput value={confirmPassword} onChangeText={setConfirmPassword} placeholder="비밀번호 확인" containerStyle={styles.passwordInput} accessibilityLabel="비밀번호 확인 입력" />

        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
          <TouchableOpacity onPress={() => setAgreed(a => !a)} accessibilityRole="checkbox" accessibilityState={{ checked: !!agreed }} style={{ marginRight: 8 }}>
            <Ionicons name={agreed ? 'checkbox' : 'square-outline'} size={22} color={agreed ? '#0a7ea4' : '#666'} />
          </TouchableOpacity>
          <Text style={styles.smallText}>서비스 이용약관 및 개인정보 처리방침에 동의합니다.</Text>
        </View>

        <View style={{ marginTop: 12 }}>
          <Text style={[styles.smallText, { marginBottom: 8 }]}>간편 가입</Text>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TouchableOpacity onPress={() => handleSocialSignUp('Google')} style={{ flex: 1, padding: 10, borderRadius: 8, backgroundColor: '#fff', alignItems: 'center', borderWidth: 1, borderColor: '#ddd' }}>
              <Text>Google로 가입</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleSocialSignUp('Apple')} style={{ flex: 1, padding: 10, borderRadius: 8, backgroundColor: '#fff', alignItems: 'center', borderWidth: 1, borderColor: '#ddd' }}>
              <Text>Apple로 가입</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.buttonsContainer}>
          <AuthButton title="회원가입" onPress={handleSignUp} loading={isLoading} disabled={isLoading} />
        </View>

        <View style={{ marginTop: 12, flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={toggleBiometrics} style={{ marginRight: 8 }} accessibilityRole="button">
            <Ionicons name={useBiometrics ? 'finger-print' : 'finger-print-outline'} size={22} color={useBiometrics ? '#0a7ea4' : '#666'} />
          </TouchableOpacity>
          <Text style={styles.smallText}>바이오 인증 사용: {useBiometrics ? '활성' : '비활성'}</Text>
        </View>
      </ScrollView>
      {showSuccess && (
        <Animated.View style={[{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.35)' }, { opacity: successOpacity }]}> 
          <View style={{ width: 160, height: 160, borderRadius: 12, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' }}>
            <Ionicons name="checkmark-circle" size={64} color="#0a7ea4" />
            <Text style={{ marginTop: 8, fontWeight: '700' }}>환영합니다!</Text>
          </View>
        </Animated.View>
      )}
    </KeyboardAvoidingView>
  );
}
