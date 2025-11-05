import { Tabs, useRouter } from 'expo-router';
import { View, Text, Pressable } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon } from '@/components/ui/icon';
import { Home, Sparkles, UserRound, SearchIcon } from 'lucide-react-native';
import { RatingDrawer } from '@/components/RatingDrawer';
import { RatingDrawerProvider } from '@/contexts/RatingDrawerContext';
import { neutral900, primaryLight } from '@/constants/constants';
import Logo from '@/assets/logo.svg'
import EventBus from '@/utils/EventBus';

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
          <View className="flex-row items-center justify-between p-6 h-20">

            <Logo height={'100%'} preserveAspectRatio="xMinYMin meet" style={{ flex: 1 }}></Logo>
            {/* <Text className="text-white text-lg font-bold">LOGO</Text> */}
            <Pressable
              onPress={() => router.navigate('/(tabs)/perfil')}
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
              animation: 'none',
              transitionSpec: {
                animation: 'timing',
                config: {
                  duration: 200,
                },
              },
              sceneStyle: { backgroundColor: 'transparent' },
              tabBarStyle: { borderTopWidth: 1, borderColor: neutral900, backgroundColor: '#000000' },
              tabBarLabelStyle: { color: 'white', fontWeight: 700, paddingTop: 4 },
              tabBarIcon: ({ color }) => (
                <Icon as={Home} style={{ width: 20, height: 20, color: color }} />
              ),
            }}
            listeners={({ navigation, route }) => ({
              tabPress: (e) => {
                const isFocused = navigation.isFocused();

                if (isFocused) {
                  // prevent re-navigation behavior
                  e.preventDefault();
                  EventBus.emit('scrollToTopHome');
                }
              },
            })}
          />

          <Tabs.Screen
            name="lancamentos"
            options={{
              title: 'Lançamentos',
              animation: 'none',
              transitionSpec: {
                animation: 'timing',
                config: {
                  duration: 200,
                },
              },
              sceneStyle: { backgroundColor: 'transparent' },
              tabBarStyle: { borderTopWidth: 1, borderColor: neutral900, backgroundColor: '#000000' },
              tabBarLabelStyle: { color: 'white', fontWeight: 700, paddingTop: 4 },
              tabBarIcon: ({ color }) => (
                <Icon as={Sparkles} style={{ width: 20, height: 20, color: color }} />
              ),
            }}
          />

          <Tabs.Screen
            name="detalhe"
            options={{
              title: 'Detalhe',
              href: null,
              animation: 'none',
              transitionSpec: {
                animation: 'timing',
                config: {
                  duration: 200,
                },
              },
              sceneStyle: { backgroundColor: 'transparent' },
              tabBarStyle: { borderTopWidth: 1, borderColor: neutral900, backgroundColor: '#000000' },
            }}
          />

          <Tabs.Screen
            name="perfil"
            options={{
              title: 'Perfil',
              href: null,
              animation: 'none',
              transitionSpec: {
                animation: 'timing',
                config: {
                  duration: 200,
                },
              },
              sceneStyle: { backgroundColor: 'transparent' },
              tabBarStyle: { borderTopWidth: 1, borderColor: neutral900, backgroundColor: '#000000' },
              tabBarLabelStyle: { color: 'white', fontWeight: 700, paddingTop: 4 },
              tabBarIcon: ({ color }) => (
                <Icon as={UserRound} style={{ width: 20, height: 20, color: color }} />
              ),
            }}
          />
        </Tabs>

        <RatingDrawer />
      </SafeAreaView>
    </RatingDrawerProvider>
  );
}
