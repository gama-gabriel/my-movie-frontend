import { useAuth } from '@clerk/clerk-expo'
import { Redirect, Stack } from 'expo-router'

export default function AuthRoutesLayout() {
  const { isSignedIn } = useAuth()

  if (isSignedIn) {
    return <Redirect href={'/(home)'} />
  }

  return (
    <Stack
      screenOptions={{
        animationMatchesGesture: true,
        contentStyle: { backgroundColor: 'black' },
        headerShown: false,
        presentation: 'transparentModal',
        animationDuration: 100,
        animation: 'fade_from_bottom',
        animationTypeForReplace: 'push',
      }}
    />
  );
}
