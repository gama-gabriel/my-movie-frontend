import { useAuth } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';

import { ActivityIndicator, Text, View } from 'react-native';

export default function SplashScreen() {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useAuth();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isLoaded && mounted) {
      if (isSignedIn) {
        router.replace('/(home)');
      } else {
        router.replace('/(auth)/home');
      }
    }
  }, [isLoaded, isSignedIn, mounted, router]);

  return (
    <View className="flex-1 items-center justify-center bg-black text-white">
      <ActivityIndicator size="large" className='text-purple-400' />
      <Text className="mt-4 text-lg font-bold">Carregando...</Text>
    </View>
  );
}
