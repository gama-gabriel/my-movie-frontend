import { Button, ButtonText } from '@/components/ui/button'
import { Heading } from '@/components/ui/heading'
import { useRouter } from 'expo-router'
import { View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import SignInGoogleButton from '../components/SignInGoogleButton'
import { AnimatedButton } from '../components/AnimatedButton'
import { primary, primaryDark, secondary } from '@/constants/constants'

export default function Page() {
  const router = useRouter();

  const redirectLogin = () => {
    router.push('/(auth)/login')
  }

  const redirectCadastro = () => {
    router.push('/(auth)/cadastro')
  }

  return (
    <SafeAreaView edges={['top']} className='flex-1 items-center justify-start gap-4 p-4 bg-black'>
      <View className='flex-1 items-center justify-center gap-4 py-4 bg-black'>
        <Heading size='4xl'>MyMovie</Heading>
      </View>

      <View className='items-center justify-center gap-6 py-12 w-full'>
        <SignInGoogleButton />

        <AnimatedButton activeColor={primaryDark} inactiveColor={primary} size='xl' className='w-full' onPress={redirectLogin}>
          <ButtonText className='text-white'>Entrar</ButtonText>
        </AnimatedButton>

        <AnimatedButton activeColor={`${secondary}80`} inactiveColor={secondary} size='xl' className='w-full' onPress={redirectCadastro}>
          <ButtonText className='text-white'>Criar conta</ButtonText>
        </AnimatedButton>
      </View>
    </SafeAreaView>


  )
}
