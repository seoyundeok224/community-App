import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { signOut } from 'firebase/auth';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Image, StyleSheet, View } from 'react-native';
import 'react-native-reanimated';
import { auth } from './firebase';

import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const [showSplash, setShowSplash] = useState(true);
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const timeout = setTimeout(() => {
      Animated.timing(opacity, { toValue: 0, duration: 600, useNativeDriver: true }).start(() => setShowSplash(false));
    }, 600);
    return () => clearTimeout(timeout);
  }, [opacity]);

  useEffect(() => {
    // Ensure any persisted auth session is cleared as early as possible
    // so the app shows the login screen first instead of resuming a
    // previous signed-in session.
    (async () => {
      try {
        await signOut(auth);
      } catch {
        // ignore errors
      } finally {
        // redirect to auth screen; replace so user can't go back
        router.replace('/auth');
      }
    })();
  }, [router]);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />

      {showSplash && (
        <Animated.View style={[StyleSheet.absoluteFill, styles.splashContainer, { opacity }]}>
          <View style={styles.splashInner}>
            <Image source={require('../assets/images/splash-icon.png')} style={styles.splashImage} resizeMode="contain" />
          </View>
        </Animated.View>
      )}
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  splashContainer: {
    backgroundColor: '#ffffff',
    zIndex: 9999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  splashInner: {
    width: '100%',
    alignItems: 'center',
  },
  splashImage: {
    width: 200,
    height: 200,
  },
});
