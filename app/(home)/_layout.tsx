import { Tabs, useRouter } from 'expo-router'
import { View, Text, Pressable } from 'react-native';
import { Icon } from '@/components/ui/icon'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { Home, UserRound, Sparkles } from 'lucide-react-native'

export default function Layout() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <>

      <SafeAreaView edges={['top', 'bottom']} className='flex-1 bg-black'>
        <View style={{ top: insets.top }} className="flex-row w-full top-0 z-10 left-0 absolute items-center justify-between p-6 bg-black/90 h-20 border-b border-neutral-700">
          <Text className="text-white text-lg font-bold">LOGO</Text>
          <Pressable onPress={() => router.push('/perfil')} className="p-3 rounded-full bg-neutral-900">
            <Icon as={UserRound}></Icon>
          </Pressable>
        </View>
        <View className='flex-1'>
          <Tabs
            screenOptions={{ tabBarActiveTintColor: "#df9eff", tabBarStyle: { backgroundColor: '#000', borderTopWidth: 0, elevation: 0, shadowOpacity: 0 }, headerShown: false }}
          >
            <Tabs.Screen
              name="index"
              options={{
                title: 'Para você',
                tabBarStyle: { borderTopWidth: 0, backgroundColor: '#000' },
                tabBarLabelStyle: { color: 'white', fontWeight: 700, fontSize: 12, paddingTop: 4 },
                tabBarIcon: ({ color, size }) => (
                  <Icon as={Home} style={{ width: size, height: size, color: color }} />
                ),
              }}
            />
            <Tabs.Screen
              name="lancamentos"
              options={{
                title: 'Lançamentos',
                tabBarStyle: { borderTopWidth: 0, backgroundColor: '#000' },
                tabBarLabelStyle: { color: 'white', fontWeight: 700, fontSize: 12, paddingTop: 4 },
                tabBarIcon: ({ color, size }) => (
                  <Icon as={Sparkles} style={{ width: size, height: size, color: color }} />
                ),
              }}
            />
          </Tabs>
        </View>

      </SafeAreaView>
    </>
  )
}