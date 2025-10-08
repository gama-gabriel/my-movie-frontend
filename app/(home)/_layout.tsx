import { useRouter, withLayoutContext, usePathname } from 'expo-router';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { View, Pressable, Text } from 'react-native';
import { Home, Sparkles, UserRound } from 'lucide-react-native';
import { Icon } from '@/components/ui/icon';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

const Tab = createMaterialTopTabNavigator();

// Type-safe tabs component
export const Tabs = withLayoutContext(Tab.Navigator);

export default function Layout() {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView edges={['top', 'bottom']} className="flex-1 bg-black">
      <View className='absolute w-full left-0 z-10 h-20 bg-black/90 border-b border-neutral-900'
        style={{
          top: insets.top,
        }}
      >
        <View className="flex-row items-center justify-between p-6 h-full">
          <Text className="text-white text-lg font-bold">LOGO</Text>
          <Pressable onPress={() => router.push('/perfil')} className="p-3 rounded-full bg-neutral-900">
            <Icon as={UserRound}></Icon>
          </Pressable>
        </View>
      </View>
      <Tabs
        screenOptions={{
          sceneStyle: { backgroundColor: 'transparent' },
          swipeEnabled: true,
          tabBarStyle: { display: 'none' },
        }}
      >
        <Tabs.Screen name="index" options={{ title: 'Para você' }} />
        <Tabs.Screen name="lancamentos" options={{ title: 'Lançamentos' }} />
      </Tabs>

      <View className="flex-row bg-black border-t border-neutral-900 justify-around p-3">
        <TabButton
          icon={Home}
          label="Para você"
          route="/(home)"
          isSelected={pathname === "/" || pathname === "/index"}
        />
        <TabButton
          icon={Sparkles}
          label="Lançamentos"
          route="/(home)/lancamentos"
          isSelected={pathname === "/lancamentos"}
        />
      </View>
    </SafeAreaView>
  );
}

type TabButtonProps = {
  icon: React.ComponentType<{ size?: number; color?: string }>;
  label: string;
  route: '/(home)' | '/(home)/lancamentos';
  isSelected: boolean;
};

function TabButton({ icon, label, route, isSelected }: TabButtonProps) {
  const router = useRouter();
  const activeColor = "#df9eff";
  const inactiveColor = "white";

  return (
    <Pressable
      onPress={() => router.push(route)}
      className="items-center gap-1"
    >
      <Icon
        as={icon}
        style={{
          color: isSelected ? activeColor : inactiveColor,
          width: 20,
          height: 20
        }}
      />
      <Text
        style={{
          color: "white",
          fontSize: 12,
          fontWeight: '600'
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
