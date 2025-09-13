import { Alert, AlertIcon, AlertText } from "@/components/ui/alert";
import { Button, ButtonSpinner, ButtonText } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { EyeIcon, EyeOffIcon, InfoIcon } from "@/components/ui/icon";
import { Input, InputField, InputIcon, InputSlot } from "@/components/ui/input";
import { useSignIn } from "@clerk/clerk-expo";
import React, { useState } from "react";
import { Keyboard, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ForgotPasswordScreen() {
  const { signIn, setActive } = useSignIn();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");

  const [senha, setSenha] = useState("");
  const [senhaConfirmada, setSenhaConfirmada] = React.useState('')
  const [mostrarSenha, setMostrarSenha] = React.useState(false)
  const [senhaValida, setSenhaValida] = React.useState(true)
  const [senhasIguais, setSenhasIguais] = React.useState(true)

  const [mensagemErroEmail, setMensagemErroEmail] = useState<string | null>(null);
  const [mensagemErro, setMensagemErro] = useState<string | null>(null);

  const [step, setStep] = useState<"request" | "verify">("request");

  const [loading, setLoading] = useState(false)

  const checkSenha = (senha: string): boolean => {
    setSenha(senha)
    const senhaRegex = /^.{8,64}$/
    setSenhaValida(senhaRegex.test(senha))
    return senhaRegex.test(senha)
  }

  const changeSenhaConfirmada = (password: string) => {
    setSenhaConfirmada(password)
    checkSenhasIguais(password)
  }

  const checkSenhasIguais = (password?: string): boolean => {
    setSenhasIguais(password ? password === senha : senha === senhaConfirmada)
    return password ? password === senha : senha === senhaConfirmada
  }

  const handleState = () => {
    setMostrarSenha((state) => {
      return !state;
    });
  };

  const requestReset = async () => {
    setLoading(true)
    setMensagemErroEmail(null)
    try {
      await signIn!.create({
        strategy: "reset_password_email_code",
        identifier: email,
      });
      setStep("verify");
    } catch (err: any) {
      setMensagemErroEmail(err.errors?.[0]?.longMessage || "Ocorreu um erro. Tente novamente.");
    } finally {
      setLoading(false)
    }
  };

  const verifyReset = async () => {
    const validacaoSenha = checkSenha(senha)
    const validacaoSenhasIguais = checkSenhasIguais()
    if (!validacaoSenha || !validacaoSenhasIguais) return

    setLoading(true)
    setMensagemErro(null)

    try {
      const result = await signIn!.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code,
        password: senha,
      });

      if (result.status === "complete") {
        await setActive!({ session: result.createdSessionId });
      }
    } catch (err: any) {
      setMensagemErro(err.errors?.[0]?.longMessage || "Ocorreu um erro. Tente novamente.");
    } finally {
      setLoading(false)
    }
  };

  return (
    <SafeAreaView edges={['top']} className='flex-1 items-center justify-start p-4 bg-black'>
      <Pressable className='w-full h-full items-center justify-start gap-4' onPress={() => { Keyboard.dismiss() }}>
        <Heading className="m-0 text-4xl font-bold text-white">
          Alterar senha
        </Heading>

        {step === "request" && (
          <View className="flex flex-col w-full gap-6">
            <View className='flex flex-col w-full gap-1'>

              <Text className='text-white pb-1 font-bold ps-6'>E-mail</Text>
              <Input size='xl' >
                <InputField
                  type='text'
                  value={email}
                  onChangeText={(email) => setEmail(email)}
                  autoComplete='email'
                  autoCapitalize='none'
                  placeholder='seuemail@email.com' />
              </Input>

            </View>

              {mensagemErroEmail &&
                <Alert action="error" className="gap-3 w-full p-4 rounded-3xl">
                  <AlertIcon as={InfoIcon} size="xl" className="fill-none text-red-500" />
                  <AlertText size="lg" className='text-white pe-4 ps-4 flex-1 flex-wrap'>
                    {mensagemErroEmail}
                  </AlertText>
                </Alert>
              }

            <Button variant='solid' size='xl' className='w-full' onPress={requestReset}>
              <ButtonSpinner className={loading ? 'data-[active=true]:text-neutral-100' : 'hidden'} color='white' ></ButtonSpinner>
              <ButtonText className='text-white'>Enviar código</ButtonText>
            </Button>
          </View>
        )}

        {step === "verify" && (
          <View className="flex flex-col w-full gap-4">
            <Alert action="info" className="gap-3 w-full p-4 rounded-3xl">
              <AlertIcon as={InfoIcon} size="xl" className="fill-none text-blue-500" />
              <AlertText size="lg" className='text-white pe-4 ps-4 flex-1 flex-wrap'>
                Informe o código enviado para seu e-mail e sua nova senha
              </AlertText>
            </Alert>

            <View className='flex flex-col w-full gap-1 pb-6'>

              <Text className='text-white pb-1 font-bold ps-6'>Código</Text>
              <Input size='xl' >
                <InputField
                  type='text'
                  keyboardType="numeric"
                  value={code}
                  onChangeText={(code) => setCode(code)}
                  placeholder="Digite o código de verificação"
                />
              </Input>
            </View>

            <View className='flex flex-col w-full gap-1'>
              <Text className='text-white pb-1 ps-6 font-bold'>Nova senha</Text>

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
              <Text className='text-white pb-1 ps-6 font-bold'>Confirmar nova senha</Text>

              <Input size='xl' isInvalid={!senhasIguais}>
                <InputField
                  value={senhaConfirmada}
                  onChangeText={(password) => changeSenhaConfirmada(password)}
                  onBlur={() => checkSenhasIguais()}
                  type={mostrarSenha ? 'text' : 'password'}
                  autoCapitalize='none'
                  autoComplete='password'
                  placeholder='No mímimo 8 caracteres' />

                <InputSlot className="pr-6" onPress={handleState}>
                  <InputIcon as={mostrarSenha ? EyeIcon : EyeOffIcon} />
                </InputSlot>
              </Input>

              <Text className={`text-red-300 ps-6 ${senhasIguais ? 'invisible' : ''}`}>Senhas não conferem</Text>

              {mensagemErro &&
                <Alert action="error" className="gap-3 w-full p-4 rounded-3xl">
                  <AlertIcon as={InfoIcon} size="xl" className="fill-none text-red-500" />
                  <AlertText size="lg" className='text-white pe-4 ps-4 flex-1 flex-wrap'>
                    {mensagemErro}
                  </AlertText>
                </Alert>
              }

            </View>

            <Button variant='solid' size='xl' className='w-full' onPress={verifyReset}>
              <ButtonSpinner className={loading ? 'data-[active=true]:text-neutral-100' : 'hidden'} color='white' ></ButtonSpinner>
              <ButtonText className='text-white'>Alterar senha</ButtonText>
            </Button>

          </View>
        )}
      </Pressable>
    </SafeAreaView>
  );
}
