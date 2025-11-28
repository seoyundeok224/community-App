import { Tabs, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Keyboard, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../firebase';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const hideSub = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));
    return () => {
      showSub.remove(); hideSub.remove();
    };
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, user => {
      setIsAuthenticated(!!user);
    });
    return () => unsub();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch {
      // ignore sign out errors
    }
    setIsAuthenticated(false);
    router.replace('/auth');
  };
 

  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: true,
        headerTitleAlign: 'center',
        headerStyle: { backgroundColor: Colors[colorScheme ?? 'light'].background },
        // hide the tabBar item for any route that is not index/explore
        tabBarItemStyle: (route.name === 'index' || route.name === 'explore') ? undefined : { width: 0, padding: 0, display: 'none' },
        tabBarButton: (props) => {
          if (route.name === 'index') return <HapticTab {...props as any} position="left" />;
          if (route.name === 'explore') return <HapticTab {...props as any} position="right" />;
          return null;
        },
        tabBarShowLabel: true,
        tabBarLabelStyle: { fontSize: 12, marginBottom: 6 },
        tabBarStyle: [{
          position: 'absolute',
          left: 16,
          right: 16,
          bottom: Platform.OS === 'ios' ? 24 : 12,
          height: 64,
          borderRadius: 16,
          paddingHorizontal: 12,
          backgroundColor: Colors[colorScheme ?? 'light'].background,
          // hide tab bar until auth state is known and user is authenticated
          display: keyboardVisible || isAuthenticated !== true ? 'none' : 'flex'
        }],
        headerRight: () => (
          <TouchableOpacity onPress={handleLogout} accessibilityRole="button">
            <Text style={{ marginRight: 12, color: Colors[colorScheme ?? 'light'].tint }}>로그아웃</Text>
          </TouchableOpacity>
        ),
      })}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.iconWrap}>
              <View style={[styles.iconBg, focused && { backgroundColor: Colors[colorScheme ?? 'light'].tint }]}> 
                <IconSymbol size={22} name="house.fill" color={focused ? '#fff' : color} />
              </View>
            </View>
          ),
          tabBarButton: (props) => <HapticTab {...props as any} position="left" />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.iconWrap}>
              <View style={[styles.iconBg, focused && { backgroundColor: Colors[colorScheme ?? 'light'].tint }]}> 
                <IconSymbol size={22} name="paperplane.fill" color={focused ? '#fff' : color} />
              </View>
            </View>
          ),
          tabBarButton: (props) => <HapticTab {...props as any} position="right" />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBg: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
});
