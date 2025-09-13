import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import { ClerkProvider } from '@clerk/clerk-expo';
import { tokenCache } from '@clerk/clerk-expo/token-cache';
import '../global.css';

import { Slot } from 'expo-router';

export default function RootLayout() {
  return (
    <ClerkProvider tokenCache={tokenCache} publishableKey={process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY}>
      <GluestackUIProvider mode="dark" >
        <Slot/>
      </GluestackUIProvider>
    </ClerkProvider>
  );
}

