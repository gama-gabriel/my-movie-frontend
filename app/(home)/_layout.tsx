import { Stack } from 'expo-router/stack'

export default function Layout() {
  return <Stack screenOptions={{
    headerShown: false,
    contentStyle: { backgroundColor: 'black' },
    presentation: 'transparentModal',
    animationDuration: 300,
    animation: 'fade_from_bottom',
    animationTypeForReplace: 'pop',
  }} />
}