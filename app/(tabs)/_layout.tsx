import { Tabs  } from 'expo-router';
import { SafeAreaView  } from 'react-native-safe-area-context';
import { Icon } from '@/components/ui/icon';
import { Home, UserRound, SearchIcon, BookmarkIcon } from 'lucide-react-native';
import { RatingDrawer } from '@/components/RatingDrawer';
import { RatingDrawerProvider } from '@/contexts/RatingDrawerContext';
import { neutral900, primaryLight } from '@/constants/constants';
import EventBus from '@/utils/EventBus';

export default function Layout() {

  return (
    <RatingDrawerProvider>
      <SafeAreaView edges={['top', 'bottom']} className="flex-1 bg-black">

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
                  e.preventDefault();
                  EventBus.emit('scrollToTopHome');
                }
              },
            })}
          />

          <Tabs.Screen
            name="pesquisa"
            options={{
              title: 'Procurar',
              sceneStyle: { backgroundColor: 'transparent' },
              tabBarStyle: { borderTopWidth: 1, borderColor: neutral900, backgroundColor: '#000000' },
              tabBarLabelStyle: { color: 'white', fontWeight: 700, paddingTop: 4 },
              tabBarIcon: ({ color }) => (
                <Icon as={SearchIcon} style={{ width: 20, height: 20, color: color }} />
              ),
            }}
          />

          <Tabs.Screen
            name="lista"
            options={{
              title: 'Minha lista',
              sceneStyle: { backgroundColor: 'transparent' },
              tabBarStyle: { borderTopWidth: 1, borderColor: neutral900, backgroundColor: '#000000' },
              tabBarLabelStyle: { color: 'white', fontWeight: 700, paddingTop: 4 },
              tabBarIcon: ({ color }) => (
                <Icon as={BookmarkIcon} style={{ width: 20, height: 20, color: color }} />
              ),
            }}
          />

          <Tabs.Screen
            name="detalhe"
            options={{
              title: 'Detalhe',
              href: null,
              sceneStyle: { backgroundColor: 'transparent' },
              tabBarStyle: { borderTopWidth: 1, borderColor: neutral900, backgroundColor: '#000000' },
            }}
          />

          <Tabs.Screen
            name="perfil"
            options={{
              title: 'Perfil',
              href: null,
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
