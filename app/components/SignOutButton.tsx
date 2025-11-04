import { AlertDialog, AlertDialogBackdrop, AlertDialogBody, AlertDialogContent, AlertDialogFooter, AlertDialogHeader } from '@/components/ui/alert-dialog'
import { ButtonIcon, ButtonText } from '@/components/ui/button'
import { useClerk } from '@clerk/clerk-expo'
import { useRouter } from 'expo-router'
import React from 'react'
import { Text } from 'react-native'
import { AnimatedButton } from './AnimatedButton'
import {  neutral100, neutral900 } from '@/constants/constants'
import { LogOutIcon } from 'lucide-react-native'

const SignOutButton = () => {
  // Use `useClerk()` to access the `signOut()` function
  const { signOut } = useClerk()
  const router = useRouter()

  const [mostrarDialogConfirmacao, setMostrarDialogConfirmacao] = React.useState(false);

  const handleClose = () => setMostrarDialogConfirmacao(false);

  const handleSignOut = async () => {
    try {
      await signOut()
      router.replace('/(auth)/home')
      // Redirect to your desired page
    } catch (err) {
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling
      console.error(JSON.stringify(err, null, 2))
    }
  }

  const DialogConfirmarSair = () => {
    return (
      <AlertDialog isOpen={mostrarDialogConfirmacao} onClose={handleClose} size="md">
        <AlertDialogBackdrop />

        <AlertDialogContent className='rounded-3xl bg-black'>
          <AlertDialogHeader>
            <Text className="text-white font-bold text-lg py-2">
              Sair
            </Text>
          </AlertDialogHeader>

          <AlertDialogBody className="py-2">
            <Text className="text-white">
              Tem certeza que deseja sair?
            </Text>
          </AlertDialogBody>

          <AlertDialogFooter className="py-2">
            <AnimatedButton
              inactiveColor='transparent'
              activeColor={neutral900}
              className="border border-neutral-500"
              variant="outline"
              action="secondary"
              onPress={handleClose}
              size="lg"
            >
              <ButtonText>Cancelar</ButtonText>
            </AnimatedButton>

            <AnimatedButton
              inactiveColor='transparent'
              activeColor={neutral900}
              className='border border-danger'
              size="lg"
              onPress={handleSignOut}>
              <ButtonText>Sair</ButtonText>
            </AnimatedButton>
          </AlertDialogFooter>

        </AlertDialogContent>
      </AlertDialog>
    )
  }

  return (
    <>
      <AnimatedButton
        inactiveColor='transparent'
        activeColor={neutral900}
        variant='outlined'
        size='xl'
        className='w-full border border-danger'
        onPress={() => setMostrarDialogConfirmacao(true)}>
        <ButtonIcon as={LogOutIcon} color={neutral100}></ButtonIcon>
        <ButtonText className='text-white pl-4'>Sair</ButtonText>
      </AnimatedButton>
      <DialogConfirmarSair />
    </>


  )
}

export default SignOutButton;