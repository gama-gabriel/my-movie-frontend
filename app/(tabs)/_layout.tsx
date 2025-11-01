import { Tabs, useRouter } from 'expo-router';
import { View, Text, Pressable } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '@/components/ui/icon';
import { Home, Sparkles, UserRound } from 'lucide-react-native';
import { RatingDrawer } from '@/components/RatingDrawer';
import { RatingDrawerProvider } from '@/contexts/RatingDrawerContext';
import { neutral900, primaryLight } from '@/constants/constants';

export default function Layout() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <RatingDrawerProvider>
      <SafeAreaView edges={['top', 'bottom']} className="flex-1 bg-black">
        {/* Custom Header */}
        <View
          className="absolute w-full left-0 z-10 h-20 bg-black/90 border-b border-neutral-900"
          style={{ top: insets.top }}
        >
          <View className="flex-row items-center justify-between p-6 h-full">
            <Text className="text-white text-lg font-bold">LOGO</Text>
            <Pressable
              onPress={() => router.push('/(pesquisa)')}
              className="p-3 rounded-full bg-neutral-900"
            >
              <Icon as={UserRound} />
            </Pressable>
          </View>
        </View>

        <Tabs
          screenOptions={{
            tabBarActiveTintColor: primaryLight,
            tabBarStyle: {
              backgroundColor: 'black',
              elevation: 0,
              shadowOpacity: 0
            },
            headerShown: false,
          }}
        >
          <Tabs.Screen
            name="home"
            options={{
              title: 'Para você',
              animation: 'fade',
              transitionSpec: {
                animation: 'timing',
                config: {
                  duration: 200,
                },
              },
              sceneStyle: { backgroundColor: 'black' },
              tabBarStyle: { borderTopWidth: 1, borderColor: neutral900, backgroundColor: '#000000' },
              tabBarLabelStyle: { color: 'white', fontWeight: 700, paddingTop: 4 },
              tabBarIcon: ({ color }) => (
                <Icon as={Home} style={{ width: 20, height: 20, color: color }} />
              ),
            }}
          />

          <Tabs.Screen
            name="lancamentos"
            options={{
              title: 'Lançamentos',
              animation: 'fade',
              transitionSpec: {
                animation: 'timing',
                config: {
                  duration: 200,
                },
              },
              sceneStyle: { backgroundColor: 'black' },
              tabBarStyle: { borderTopWidth: 1, borderColor: neutral900, backgroundColor: '#000000' },
              tabBarLabelStyle: { color: 'white', fontWeight: 700, paddingTop: 4 },
              tabBarIcon: ({ color }) => (
                <Icon as={Sparkles} style={{ width: 20, height: 20, color: color }} />
              ),
            }}
          />

          <Tabs.Screen
            name="perfil"
            options={{
              title: 'Perfil',
              animation: 'fade',
              transitionSpec: {
                animation: 'timing',
                config: {
                  duration: 200,
                },
              },
              sceneStyle: { backgroundColor: 'black' },
              tabBarStyle: { borderTopWidth: 1, borderColor: neutral900, backgroundColor: '#000000' },
              tabBarLabelStyle: { color: 'white', fontWeight: 700, paddingTop: 4 },
              tabBarIcon: ({ color }) => (
                <Icon as={Sparkles} style={{ width: 20, height: 20, color: color }} />
              ),
            }}
          />
        </Tabs>

        <RatingDrawer />
      </SafeAreaView>
    </RatingDrawerProvider>
  );
}
