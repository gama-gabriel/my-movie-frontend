import { Button, ButtonSpinner, ButtonText } from '@/components/ui/button'
import { Heading } from '@/components/ui/heading'
import { EyeIcon, EyeOffIcon, InfoIcon } from '@/components/ui/icon'
import { Input, InputField, InputIcon, InputSlot } from '@/components/ui/input'
import { useSignIn } from '@clerk/clerk-expo'
import { Link, useRouter } from 'expo-router'
import React from 'react'
import { Keyboard, Pressable, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import SignInGoogleButton from '../components/SignInGoogleButton'
import { Alert, AlertIcon, AlertText } from '@/components/ui/alert'

export default function Page() {
  const { signIn, setActive, isLoaded } = useSignIn()
  const router = useRouter();

  const [email, setEmail] = React.useState('')
  const [emailValido, setEmailValido] = React.useState(true)

  const [senha, setSenha] = React.useState('')
  const [mostrarSenha, setMostrarSenha] = React.useState(false)
  const [senhaValida, setSenhaValida] = React.useState(true)

  const [mensagemErro, setMensagemErro] = React.useState<string | null>(null);

  const [loading, setLoading] = React.useState(false)

  const checkEmail = (email: string) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    setEmailValido(emailRegex.test(email))
  }

  const checkSenha = (senha: string) => {
    setSenha(senha)
    const senhaRegex = /^.{8,64}$/
    setSenhaValida(senhaRegex.test(senha))
  }

  const handleState = () => {
    setMostrarSenha((state) => {
      return !state;
    });
  };

  // Handle the submission of the sign-in form
  const onEntrarPress = async () => {
    if (!emailValido || !senhaValida) return
    if (!isLoaded) return

    setLoading(true)

    setMensagemErro(null)

    // Start the sign-in process using the email and password provided
    try {
      const signInAttempt = await signIn.create({
        identifier: email,
        password: senha,
      })

      // If sign-in process is complete, set the created session as active
      // and redirect the user
      if (signInAttempt.status === 'complete') {
        await setActive({ session: signInAttempt.createdSessionId })
        router.replace('/');
      } else {
        // If the status isn't complete, check why. User might need to
        // complete further steps.
        console.error(JSON.stringify(signInAttempt, null, 2))
      }
    } catch (err: any) {
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling
      setMensagemErro(err.errors?.[0]?.longMessage || 'Ocorreu um erro. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView edges={['top']} className='flex-1 items-center justify-start p-4 bg-black'>
      <Pressable className='w-full h-full items-center justify-start gap-4' onPress={() => { Keyboard.dismiss() }}>

        <Heading className="m-0 text-4xl font-bold text-white">
          Entrar
        </Heading>

        <SignInGoogleButton />

        <View className='text-neutral-100 p-0'>
          <Text className='text-neutral-100 w-fit font-bold'>ou</Text>
        </View>

        <View className='w-full flex flex-col gap-2 pb-6'>
          <View className='flex flex-col w-full gap-1'>
            <Text className='text-white pb-1 font-bold ps-6'>E-mail</Text>
            <Input size='xl' isInvalid={!emailValido}>
              <InputField
                type='text'
                value={email}
                onBlur={() => { checkEmail(email) }}
                onChangeText={(email) => setEmail(email)}
                autoComplete='email'
                autoCapitalize='none'
                placeholder='seuemail@email.com' />
            </Input>

            <Text className={`text-red-300 ps-6 pt-1 ${emailValido ? 'invisible' : ''}`}>E-mail inválido</Text>

          </View>

          <View className='flex flex-col w-full gap-1'>
            <Text className='text-white pb-1 font-bold ps-6'>Senha</Text>

            <Input size='xl' isInvalid={!senhaValida}>
              <InputField
                type={mostrarSenha ? 'text' : 'password'}
                value={senha}
                onChangeText={(senha) => checkSenha(senha)}
                onSubmitEditing={onEntrarPress}
                autoCapitalize='none'
                autoComplete='password'
                placeholder='No mímimo 8 caracteres' />

              <InputSlot className="pr-4" onPress={handleState}>
                <InputIcon as={mostrarSenha ? EyeIcon : EyeOffIcon} />
              </InputSlot>
            </Input>

            <Text className={`text-red-300 ps-6 pt-1 ${senhaValida ? 'invisible' : ''}`}>Senha inválida</Text>

            {mensagemErro &&
              <Alert action="error" className="gap-3 w-full p-4 rounded-3xl">
                <AlertIcon as={InfoIcon} size="xl" className="fill-none text-red-500" />
                <AlertText size="lg" className='text-white pe-4 ps-4 flex-1 flex-wrap'>
                  {mensagemErro}
                </AlertText>
              </Alert>
            }

          </View>
        </View>

        <Button onPress={onEntrarPress} variant='solid' action='primary' size='xl' className='w-full transition disabled:bg-primary-black'>
          <ButtonSpinner className={loading ? 'data-[active=true]:text-neutral-100' : 'hidden'} color='white' ></ButtonSpinner>
          <ButtonText className='text-white font-bold pl-4 data-[disabled=true]:text-neutral-500'>Continuar</ButtonText>
        </Button>



        <View className='flex flex-col items-center justify-center gap-4 '>
          <View className='flex-row '>
            <Link href="/(auth)/trocar-senha" className='text-primary-light underline'>
              Esqueci minha senha
            </Link>
          </View>

          <View className='flex-row'>
            <Text className='text-white'>Não possui uma conta?</Text>

            <Link href="/(auth)/cadastro">
              <Text className='text-primary-light'> Cadastre-se</Text>
            </Link>
          </View>
        </View>

      </Pressable>

    </SafeAreaView>
  )
}