import { Button, ButtonText } from '@/components/ui/button'
import { Heading } from '@/components/ui/heading'
import { SignedIn, SignedOut } from '@clerk/clerk-expo'
import { useRouter } from 'expo-router'
import { Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function Page() {
  const router = useRouter();

  const redirectPerfil = () => {
    router.push('/(home)/(perfil)')
  }

  return (
    <SafeAreaView edges={['top']} className='flex-1 items-center justify-start gap-4 p-4 bg-black'>
      <SignedIn>
        <View className='flex-1 items-center justify-start gap-6 bg-black w-full h-full'>

          <Heading className="m-0 text-4xl font-bold text-white">
            Home
          </Heading>

          <Text className='text-white font-bold'>Seja bem-vindo!</Text>

          <Button variant='outlined' size='xl' className='bg-transparent rounded-full border border-neutral-500 transition data-[active=true]:bg-neutral-700 disabled:bg-primary-black' onPress={redirectPerfil}>
            <ButtonText className='text-white'>Meu perfil</ButtonText>
          </Button>

        </View>
      </SignedIn>

      <SignedOut>
        <View className='flex-1 items-center justify-start gap-4 py-4 w-full h-full'>
          <View className='animate-pulse h-16 w-full bg-neutral-900' />
        </View>
      </SignedOut>
    </SafeAreaView>


  )
}
