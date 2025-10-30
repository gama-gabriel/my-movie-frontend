import { Stack } from "expo-router";

export default function PerfilRoutesLayout() {
  return (
    <Stack
      screenOptions={{
        animationMatchesGesture: true,
        contentStyle: { backgroundColor: 'black' },
        headerShown: false,
        presentation: 'transparentModal',
        animationDuration: 100,
        animation: 'fade_from_bottom',
        animationTypeForReplace: 'pop',
      }}
    />
  );
}
