import { Button, ButtonSpinner, ButtonText } from '@/components/ui/button'
import { Heading } from '@/components/ui/heading'
import { EyeIcon, EyeOffIcon, InfoIcon } from '@/components/ui/icon'
import { Input, InputField, InputIcon, InputSlot } from '@/components/ui/input'
import { useSignUp } from '@clerk/clerk-expo'
import { Link, useRouter } from 'expo-router'
import * as React from 'react'
import { Keyboard, Pressable, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import SignInGoogleButton from '../components/SignInGoogleButton'
import { Alert, AlertIcon, AlertText } from '@/components/ui/alert'

export default function Cadastro() {
  const { isLoaded, signUp, setActive } = useSignUp()
  const router = useRouter();

  const [email, setEmail] = React.useState('')
  const [emailValido, setEmailValido] = React.useState(true)

  const [senha, setSenha] = React.useState('')
  const [senhaConfirmada, setSenhaConfirmada] = React.useState('')
  const [mostrarSenha, setMostrarSenha] = React.useState(false)
  const [senhaValida, setSenhaValida] = React.useState(true)
  const [senhasIguais, setSenhasIguais] = React.useState(true)

  const [pendingVerification, setPendingVerification] = React.useState(false)
  const [codigo, setCodigo] = React.useState('')
  const [codigoValido, setCodigoValido] = React.useState(true)

  const [mensagemErroCadastro, setMensagemErroCadastro] = React.useState('')
  const [mensagemErroCodigo, setMensagemErroCodigo] = React.useState('')

  const [loading, setLoading] = React.useState(false)

  const checkEmail = (email: string): boolean => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    setEmailValido(emailRegex.test(email))
    return emailRegex.test(email)
  }

  const checkSenha = (senha: string): boolean => {
    setSenha(senha)
    const senhaRegex = /^.{8,64}$/
    setSenhaValida(senhaRegex.test(senha))
    return senhaRegex.test(senha)
  }

  const changeSenhaConfirmada = (password: string) => {
    setSenhaConfirmada(password)
    checkSenhasIguais()
  }

  const checkSenhasIguais = (): boolean => {
    setSenhasIguais(senha === senhaConfirmada)
    return senha === senhaConfirmada
  }

  const checkCodigo = (newCode: string): boolean => {
    setCodigo(String(newCode))
    const codigoRegex = /^\d{6}$/
    setCodigoValido(codigoRegex.test(newCode))
    return codigoRegex.test(newCode)
  }

  const handleState = () => {
    setMostrarSenha((state) => {
      return !state;
    });
  };

  // Handle submission of sign-up form
  const onSignUpPress = async () => {
    const validacaoEmail = checkEmail(email)
    const validacaoSenha = checkSenha(senha)
    const validacaoSenhasIguais = checkSenhasIguais()
    if (!validacaoEmail || !validacaoSenha || !validacaoSenhasIguais) return

    if (!isLoaded) return

    setLoading(true)
    setMensagemErroCadastro('')

    // Start sign-up process using email and password provided
    try {
      await signUp.create({
        emailAddress: email,
        password: senha,
      })

      // Send user an email with verification code
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })

      // Set 'pendingVerification' to true to display second form
      // and capture OTP code
      setPendingVerification(true)
    } catch (err: any) {
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling
      setMensagemErroCadastro(err.errors[0]?.longMessage || 'Ocorreu um erro desconhecido. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  // Handle submission of verification form
  const onVerifyPress = async () => {
    if (!isLoaded) return

    const validacaoCodigo = checkCodigo(codigo)
    if (!validacaoCodigo) return

    setLoading(true)
    setMensagemErroCodigo('')

    try {
      // Use the code the user provided to attempt verification
      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code: codigo,
      })

      // If verification was completed, set the session to active
      // and redirect the user
      if (signUpAttempt.status === 'complete') {
        await setActive({ session: signUpAttempt.createdSessionId })
        router.replace('/')
      } else {
        // If the status is not complete, check why. User may need to
        // complete further steps.
        console.error(JSON.stringify(signUpAttempt, null, 2))
      }
    } catch (err: any) {
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling
      setMensagemErroCodigo(err.errors[0]?.longMessage || 'Ocorreu um erro desconhecido. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  if (pendingVerification) {
    return (
      <SafeAreaView edges={['top']} className='flex-1 items-center justify-start p-4 bg-black'>
        <Pressable className='w-full h-full items-center justify-start gap-4' onPress={() => { Keyboard.dismiss() }}>
          <Heading size={'2xl'} className='text-white py-2'>Verificar e-mail</Heading>

          <View className="rounded-2xl items-start px-4 pt-2 pb-8 w-full gap-8">
            <Alert action="info" className="gap-3 w-full p-4 rounded-3xl">
              <AlertIcon as={InfoIcon} size="xl" className="fill-none text-blue-500" />
              <AlertText size="lg" className='text-white pe-4 ps-4 flex-1 flex-wrap'>
                O seu código de verificação foi enviado ao e-mail {email}
              </AlertText>
            </Alert>
            <View className='flex flex-col w-full gap-1'>

              <Text className='text-white pb-1 ps-6 font-bold w-fit'>Código de verificação</Text>

              <Input size='xl' isInvalid={!codigoValido}>
                <InputField
                  keyboardType='numeric'
                  autoCapitalize="none"
                  value={codigo}
                  placeholder="Digite o seu código de verificação"
                  onChangeText={(code) => checkCodigo(code)}
                  onSubmitEditing={onVerifyPress}
                  type='text'
                />
              </Input>
              <Text className={`text-red-300 ps-6 ${codigoValido ? 'invisible' : ''}`}>Código inválido</Text>
            </View>

            <Button onPress={onVerifyPress} variant='solid' action='primary' size='xl' className='w-full transition disabled:bg-primary-black'>
              <ButtonSpinner className={loading ? 'data-[active=true]:text-neutral-100' : 'hidden'} color='white'></ButtonSpinner>
              <ButtonText className='text-white font-bold pl-4 data-[disabled=true]:text-neutral-500'>Verificar código</ButtonText>
            </Button>

            {mensagemErroCodigo &&
              <Alert action="error" className="gap-3 w-full p-4 rounded-3xl">
                <AlertIcon as={InfoIcon} size="xl" className="fill-none text-red-500" />
                <AlertText size="lg" className='text-white pe-4 ps-4 flex-1 flex-wrap'>
                  {mensagemErroCodigo}
                </AlertText>
              </Alert>
            }

          </View>

        </Pressable>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView edges={['top']} className='flex-1 items-center justify-start p-4 bg-black'>
      <Pressable className='w-full h-full items-center justify-start gap-4' onPress={() => { Keyboard.dismiss() }}>

        <Heading className="m-0 text-4xl font-bold text-white">
          Cadastro
        </Heading>

        <SignInGoogleButton />

        <View className='text-neutral-100 p-0'>
          <Text className='text-neutral-100 w-fit font-bold'>ou</Text>
        </View>

        <View className='w-full flex flex-col gap-2 pb-6'>
          <View className='flex flex-col w-full gap-1'>
            <Text className='text-white pb-1 ps-6 font-bold'>E-mail</Text>
            <Input size='xl' isInvalid={!emailValido}>
              <InputField
                className='autofill:bg-transparent bg-red-900'
                autoCapitalize="none"
                value={email}
                placeholder="seuemail@email.com"
                onChangeText={(email) => setEmail(email)}
                type='text'
                onBlur={() => { checkEmail(email) }}
                autoComplete='email'
              />
            </Input>

            <Text className={`text-red-300 ps-6 ${emailValido ? 'invisible' : ''}`}>E-mail inválido</Text>

          </View>

          <View className='flex flex-col w-full gap-1'>
            <Text className='text-white pb-1 ps-6 font-bold'>Senha</Text>

            <Input size='xl' isInvalid={!senhaValida}>
              <InputField
                value={senha}
                onChangeText={(password) => checkSenha(password)}
                onBlur={() => checkSenhasIguais()}
                type={mostrarSenha ? 'text' : 'password'}
                autoCapitalize='none'
                autoComplete='password'
                placeholder='No mímimo 8 caracteres' />

              <InputSlot className="pr-6" onPress={handleState}>
                <InputIcon as={mostrarSenha ? EyeIcon : EyeOffIcon} />
              </InputSlot>
            </Input>

            <Text className={`text-red-300 ps-6 ${senhaValida ? 'invisible' : ''}`}>Senha inválida</Text>

          </View>

          <View className='flex flex-col w-full gap-1'>
            <Text className='text-white pb-1 ps-6 font-bold'>Confirmar senha</Text>

            <Input size='xl' isInvalid={!senhasIguais}>
              <InputField
                value={senhaConfirmada}
                onChangeText={(password) => changeSenhaConfirmada(password)}
                onBlur={() => checkSenhasIguais()}
                type={mostrarSenha ? 'text' : 'password'}
                onSubmitEditing={onSignUpPress}
                autoCapitalize='none'
                autoComplete='password'
                placeholder='No mímimo 8 caracteres' />

              <InputSlot className="pr-6" onPress={handleState}>
                <InputIcon as={mostrarSenha ? EyeIcon : EyeOffIcon} />
              </InputSlot>
            </Input>

            <Text className={`text-red-300 ps-6 ${senhasIguais ? 'invisible' : ''}`}>Senhas não conferem</Text>

            {mensagemErroCadastro &&
              <Alert action="error" className="gap-3 w-full p-4 rounded-3xl">
                <AlertIcon as={InfoIcon} size="xl" className="fill-none text-red-500" />
                <AlertText size="lg" className='text-white pe-4 ps-4 flex-1 flex-wrap'>
                  {mensagemErroCadastro}
                </AlertText>
              </Alert>
            }

          </View>
        </View>

        <Button onPress={onSignUpPress} variant='solid' action='primary' size='xl' className='w-full transition disabled:bg-primary-black'>
          <ButtonSpinner className={loading ? 'data-[active=true]:text-neutral-100' : 'hidden'} color='white'></ButtonSpinner>
          <ButtonText className='text-white font-bold pl-4 data-[disabled=true]:text-neutral-500'>Continuar</ButtonText>
        </Button>


        <View className='flex-row'>
          <Text className='text-white'>Já possui uma conta?</Text>

          <Link href="/(auth)/login">
            <Text className='text-primary-light'> Entrar</Text>
          </Link>
        </View>


      </Pressable>

    </SafeAreaView>
  )
}