import { Button, ButtonIcon, ButtonText } from '@/components/ui/button'
import { GoogleIcon } from '@/components/ui/icon'
import { useSSO } from '@clerk/clerk-expo'
import * as AuthSession from 'expo-auth-session'
import { useRouter } from 'expo-router'
import * as WebBrowser from 'expo-web-browser'
import React, { useCallback, useEffect } from 'react'

export const useWarmUpBrowser = () => {
  useEffect(() => {
    // Preloads the browser for Android devices to reduce authentication load time
    // See: https://docs.expo.dev/guides/authentication/#improving-user-experience
    void WebBrowser.warmUpAsync()
    return () => {
      // Cleanup: closes browser when component unmounts
      void WebBrowser.coolDownAsync()
    }
  }, [])
}

// Handle any pending authentication sessions
WebBrowser.maybeCompleteAuthSession()

export default function Page() {
  const router = useRouter();
  useWarmUpBrowser()

  // Use the `useSSO()` hook to access the `startSSOFlow()` method
  const { startSSOFlow } = useSSO()

  const onPress = useCallback(async () => {
    try {
      // Start the authentication process by calling `startSSOFlow()`
      const { createdSessionId, setActive } = await startSSOFlow({
        strategy: 'oauth_google',
        // For web, defaults to current path
        // For native, you must pass a scheme, like AuthSession.makeRedirectUri({ scheme, path })
        // For more info, see https://docs.expo.dev/versions/latest/sdk/auth-session/#authsessionmakeredirecturioptions
        redirectUrl: AuthSession.makeRedirectUri({native: 'mymovie://(home)/' }),
      })

      // If sign in was successful, set the active session
      if (createdSessionId) {
        setActive!({
          session: createdSessionId,
        })
        // Redirect to your app's main page after successful sign-in
        // Adjust the path as necessary
        //
          // router.replace('/(home)')
      }
    } catch (err) {
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling
      console.error(JSON.stringify(err, null, 2))
    }
  }, [startSSOFlow])

  return (
    <Button onPress={onPress} size='xl' variant='solid' action='primary' className='w-full bg-transparent rounded-full border border-neutral-500 transition data-[active=true]:bg-neutral-700 disabled:bg-primary-black'>
      <ButtonIcon as={GoogleIcon} className='text-transparent'></ButtonIcon>
      <ButtonText className='data-[active=true]:text-white pl-4'>Continuar com Google</ButtonText>
    </Button>
  )
}
