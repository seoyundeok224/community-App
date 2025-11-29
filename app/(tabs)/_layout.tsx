import { Ionicons } from '@expo/vector-icons';
import { Tabs, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Keyboard, Platform, StyleSheet, Text, TouchableOpacity } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/IconSymbol'; // string 타입으로 안전하게
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../firebase';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  const tabTranslate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const hideSub = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  useEffect(() => {
    Animated.timing(tabTranslate, {
      toValue: keyboardVisible || isAuthenticated !== true ? 100 : 0,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [keyboardVisible, isAuthenticated]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
    });
    return () => unsub();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch {}
    setIsAuthenticated(false);
    router.replace('/auth');
  };

  const renderTabIcon = (name: string, focused: boolean) => {
    const scale = new Animated.Value(1);

    const onPressIn = () =>
      Animated.spring(scale, { toValue: 1.2, useNativeDriver: true }).start();
    const onPressOut = () =>
      Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();

    return (
      <Animated.View
        style={[
          styles.iconBg,
          {
            transform: [{ scale }],
            backgroundColor: focused
              ? Colors[colorScheme ?? 'light'].tint
              : 'transparent',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: focused ? 0.2 : 0,
            shadowRadius: 5,
            elevation: focused ? 5 : 0,
          },
        ]}
      >
        <IconSymbol
          size={24}
          name={name}
          color={focused ? '#fff' : Colors[colorScheme ?? 'light'].text}
        />
      </Animated.View>
    );
  };

  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: true,
        headerTitleAlign: 'center',
        headerStyle: { backgroundColor: Colors[colorScheme ?? 'light'].background },
        tabBarItemStyle:
          route.name === 'index' || route.name === 'explore'
            ? undefined
            : { width: 0, padding: 0, display: 'none' },
        tabBarButton: (props) => {
          if (route.name === 'index') return <HapticTab {...(props as any)} position="left" />;
          if (route.name === 'explore') return <HapticTab {...(props as any)} position="right" />;
          return null;
        },
        tabBarShowLabel: true,
        tabBarLabelStyle: { fontSize: 12, marginBottom: 6 },
        tabBarStyle: [
          {
            position: 'absolute',
            left: 16,
            right: 16,
            bottom: Platform.OS === 'ios' ? 28 : 16,
            height: 80,
            borderRadius: 28,
            paddingHorizontal: 16,
            paddingTop: 8,
            transform: [{ translateY: tabTranslate }],
            backgroundColor: Colors[colorScheme ?? 'light'].background + 'CC',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.1,
            shadowRadius: 10,
            elevation: 5,
            overflow: 'hidden',
          },
        ],
        headerRight: () => (
          <TouchableOpacity
            onPress={handleLogout}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginRight: 12,
              padding: 6,
              borderRadius: 8,
              backgroundColor: '#f0f0f0',
            }}
            activeOpacity={0.7}
          >
            <Ionicons
              name="log-out-outline"
              size={18}
              color={Colors[colorScheme ?? 'light'].tint}
            />
            <Text
              style={{
                marginLeft: 6,
                color: Colors[colorScheme ?? 'light'].tint,
              }}
            >
              로그아웃
            </Text>
          </TouchableOpacity>
        ),
      })}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => renderTabIcon('home', focused),
          tabBarButton: (props) => <HapticTab {...(props as any)} position="left" />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ focused }) => renderTabIcon('paper-plane', focused),
          tabBarButton: (props) => <HapticTab {...(props as any)} position="right" />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
});
