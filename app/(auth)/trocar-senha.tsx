import { Alert, AlertIcon, AlertText } from "@/components/ui/alert";
import { ButtonSpinner, ButtonText } from "@/components/ui/button";
import { EyeIcon, EyeOffIcon, InfoIcon } from "@/components/ui/icon";
import { Input, InputField, InputIcon, InputSlot } from "@/components/ui/input";
import { primary, primaryDark } from "@/constants/constants";
import { useSignIn } from "@clerk/clerk-expo";
import React, { useEffect, useState } from "react";
import { Keyboard, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AnimatedButton } from "../components/AnimatedButton";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { router, useLocalSearchParams } from "expo-router";
import { useToastVariant } from "@/hooks/useToastVariant";

const AnimatedAlert = Animated.createAnimatedComponent(Alert);

export default function ForgotPasswordScreen() {
  const { signIn, setActive } = useSignIn();

  const [email, setEmail] = useState("");
  const [emailValido, setEmailValido] = React.useState(true)

  const [codigo, setCodigo] = useState("");
  const [codigoValido, setCodigoValido] = useState(true);

  const [senha, setSenha] = useState("");
  const [senhaConfirmada, setSenhaConfirmada] = React.useState('')
  const [mostrarSenha, setMostrarSenha] = React.useState(false)
  const [senhaValida, setSenhaValida] = React.useState(true)
  const [senhasIguais, setSenhasIguais] = React.useState(true)

  const [mensagemErroEmail, setMensagemErroEmail] = useState<string | null>(null);
  const [mensagemErro, setMensagemErro] = useState<string | null>(null);

  const [step, setStep] = useState<"request" | "verify">("request");

  const [loading, setLoading] = useState(false)

  const toast = useToastVariant()

  const { comingFrom, action, userEmail } = useLocalSearchParams<{ comingFrom: string, action: string, userEmail?: string }>();

  useEffect(() => {
    if (userEmail) {
      setEmail(userEmail)
    }
  }, [userEmail]);

  const checkSenha = (senha: string): boolean => {
    setSenha(senha)
    const senhaRegex = /^.{8,64}$/
    setSenhaValida(senhaRegex.test(senha))
    return senhaRegex.test(senha)
  }

  const checkEmail = (email: string): boolean => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    setEmailValido(emailRegex.test(email))
    return emailRegex.test(email)
  }

  const checkCodigo = (newCode: string): boolean => {
    setCodigo(String(newCode))
    const codigoRegex = /^\d{6}$/
    setCodigoValido(codigoRegex.test(newCode))
    return codigoRegex.test(newCode)
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
    const validacaoEmail = checkEmail(email)
    if (!validacaoEmail) return

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
    const validacaoCodigo = checkCodigo(codigo)
    const validacaoSenha = checkSenha(senha)
    const validacaoSenhasIguais = checkSenhasIguais()
    if (!validacaoSenha || !validacaoSenhasIguais || !validacaoCodigo) return

    setLoading(true)
    setMensagemErro(null)

    try {
      const result = await signIn!.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code: codigo,
        password: senha,
      });

      if (result.status === "complete") {
        await setActive!({ session: result.createdSessionId });
        toast.show("Senha alterada com sucesso!", "success")
        if (comingFrom === 'auth') {
          router.replace('/')
          return
        }
        router.replace('/(tabs)/perfil')
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

        <View className='flex flex-col py-6 items-center'>
          <Text className="m-0 text-4xl font-bold text-white">
            Alterar senha
          </Text>
        </View>

        {step === "request" && (
          <View className="flex flex-col w-full gap-6">
            <View className='flex flex-col w-full gap-1'>

              <Text className='text-white pb-1 font-bold ps-4 data-[readonly=true]:bg-red-900'>E-mail</Text>
              <Input size='xl' isReadOnly={!!userEmail}>
                <InputField
                  type='text'
                  value={email}
                  onChangeText={(email) => {
                    setEmail(email)
                    setEmailValido(true)
                  }}
                  autoComplete='email'
                  autoCapitalize='none'
                  placeholder='seuemail@email.com' />
              </Input>

              <View className="ps-4 pt-1 pb-2">
                {!emailValido && (
                  <Animated.Text
                    entering={FadeIn.duration(200).springify().withInitialValues({
                      transform: [{ translateY: 20 }],
                    })}
                    exiting={FadeOut.duration(200).springify().withInitialValues({
                      transform: [{ translateY: -20 }],
                    })}
                    className="text-red-300"
                  >
                    E-mail inválido
                  </Animated.Text>
                )}
              </View>

              {mensagemErroEmail &&
                <AnimatedAlert
                  entering={FadeIn.duration(100).springify().withInitialValues({
                    transform: [{ translateY: 20 }],
                  })}
                  exiting={FadeOut.duration(100).springify().withInitialValues({
                    transform: [{ translateY: -20 }],
                  })}
                  action="error"
                  className="gap-3 w-full p-4 rounded-3xl">
                  <AlertIcon as={InfoIcon} size="xl" className="fill-none text-red-500" />
                  <AlertText size="lg" className='text-white pe-4 ps-4 flex-1 flex-wrap'>
                    {mensagemErroEmail}
                  </AlertText>
                </AnimatedAlert>
              }
            </View>

            <AnimatedButton activeColor={primaryDark} inactiveColor={primary} variant='solid' size='xl' className='w-full' onPress={requestReset}>
              <ButtonSpinner className={loading ? 'data-[active=true]:text-neutral-100' : 'hidden'} color='white' ></ButtonSpinner>
              <ButtonText className='text-white'>Enviar código</ButtonText>
            </AnimatedButton>
          </View>
        )}

        {step === "verify" && (
          <Animated.View
            entering={FadeIn.duration(200).springify().withInitialValues({
              transform: [{ translateY: 20 }],
            })}
            exiting={FadeOut.duration(200).springify().withInitialValues({
              transform: [{ translateY: -20 }],
            })}
            className="flex flex-col w-full gap-4">
            <Alert action="info" className="gap-3 w-full p-4 rounded-3xl">
              <AlertIcon as={InfoIcon} size="xl" className="fill-none text-blue-500" />
              <AlertText size="lg" className='text-white pe-4 ps-4 flex-1 flex-wrap'>
                Informe o código enviado para seu e-mail e sua nova senha
              </AlertText>
            </Alert>

            <View className='flex flex-col w-full gap-1'>
              <Text className='text-white pb-1 font-bold ps-4'>Código</Text>
              <Input size='xl' isInvalid={!codigoValido}>
                <InputField
                  type='text'
                  keyboardType="numeric"
                  value={codigo}
                  onChangeText={(code) => {
                    setCodigo(code)
                    setCodigoValido(true)
                  }}
                  placeholder="Digite o código de verificação"
                />
              </Input>
              <View className="ps-4 pt-1 pb-2">
                {!codigoValido && (
                  <Animated.Text
                    entering={FadeIn.duration(200).springify().withInitialValues({
                      transform: [{ translateY: 20 }],
                    })}
                    exiting={FadeOut.duration(200).springify().withInitialValues({
                      transform: [{ translateY: -20 }],
                    })}
                    className="text-red-300"
                  >
                    Código inválido
                  </Animated.Text>
                )}
              </View>
            </View>

            <View className='flex flex-col w-full gap-1'>
              <Text className='text-white pb-1 ps-4 font-bold'>Nova senha</Text>

              <Input size='xl' isInvalid={!senhaValida}>
                <InputField
                  value={senha}
                  onChangeText={(password) => {
                    setSenha(password)
                    setSenhaValida(true)
                    setSenhasIguais(true)
                  }}
                  type={mostrarSenha ? 'text' : 'password'}
                  autoCapitalize='none'
                  autoComplete='password'
                  placeholder='No mímimo 8 caracteres' />

                <InputSlot className="pr-6" onPress={handleState}>
                  <InputIcon as={mostrarSenha ? EyeIcon : EyeOffIcon} />
                </InputSlot>
              </Input>

              <View className="ps-4 pt-1 pb-2">
                {!senhaValida && (
                  <Animated.Text
                    entering={FadeIn.duration(200).springify().withInitialValues({
                      transform: [{ translateY: 20 }],
                    })}
                    exiting={FadeOut.duration(200).springify().withInitialValues({
                      transform: [{ translateY: -20 }],
                    })}
                    className="text-red-300"
                  >
                    Senha inválida
                  </Animated.Text>
                )}
              </View>

            </View>

            <View className='flex flex-col w-full gap-1'>
              <Text className='text-white pb-1 ps-4 font-bold'>Confirmar nova senha</Text>

              <Input size='xl' isInvalid={!senhasIguais}>
                <InputField
                  value={senhaConfirmada}
                  onChangeText={(password) => {
                    changeSenhaConfirmada(password)
                    setSenhasIguais(true)
                  }}
                  onBlur={() => checkSenhasIguais()}
                  type={mostrarSenha ? 'text' : 'password'}
                  autoCapitalize='none'
                  autoComplete='password'
                  placeholder='No mímimo 8 caracteres' />

                <InputSlot className="pr-6" onPress={handleState}>
                  <InputIcon as={mostrarSenha ? EyeIcon : EyeOffIcon} />
                </InputSlot>
              </Input>

              <View className="ps-4 pt-1 pb-2">
                {!senhasIguais && (
                  <Animated.Text
                    entering={FadeIn.duration(200).springify().withInitialValues({
                      transform: [{ translateY: 20 }],
                    })}
                    exiting={FadeOut.duration(200).springify().withInitialValues({
                      transform: [{ translateY: -20 }],
                    })}
                    className="text-red-300"
                  >
                    Senhas não conferem
                  </Animated.Text>
                )}
              </View>

              {mensagemErro &&
                <AnimatedAlert
                  entering={FadeIn.duration(100).springify().withInitialValues({
                    transform: [{ translateY: 20 }],
                  })}
                  exiting={FadeOut.duration(100).springify().withInitialValues({
                    transform: [{ translateY: -20 }],
                  })}
                  action="error"
                  className="gap-3 w-full p-4 rounded-3xl">
                  <AlertIcon as={InfoIcon} size="xl" className="fill-none text-red-500" />
                  <AlertText size="lg" className='text-white pe-4 ps-4 flex-1 flex-wrap'>
                    {mensagemErro}
                  </AlertText>
                </AnimatedAlert>
              }

            </View>

            <AnimatedButton activeColor={primaryDark} inactiveColor={primary} variant='solid' size='xl' className='w-full' onPress={verifyReset}>
              <ButtonSpinner className={loading ? 'data-[active=true]:text-neutral-100' : 'hidden'} color='white' ></ButtonSpinner>
              <ButtonText className='text-white font-bold pl-4 data-[disabled=true]:text-neutral-500'>Alterar senha</ButtonText>
            </AnimatedButton>

          </Animated.View>
        )}
      </Pressable>
    </SafeAreaView>
  );
}
