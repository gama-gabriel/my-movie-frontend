import { AlertDialog, AlertDialogBackdrop, AlertDialogBody, AlertDialogContent, AlertDialogFooter, AlertDialogHeader } from '@/components/ui/alert-dialog'
import { Button, ButtonText } from '@/components/ui/button'
import { useClerk } from '@clerk/clerk-expo'
import { useRouter } from 'expo-router'
import React from 'react'
import { Text } from 'react-native'

const SignOutButton = () => {
  // Use `useClerk()` to access the `signOut()` function
  const { signOut } = useClerk()
  const router = useRouter()

  const [mostrarDialogConfirmacao, setMostrarDialogConfirmacao] = React.useState(false);

  const handleClose = () => setMostrarDialogConfirmacao(false);

  const handleSignOut = async () => {
    try {
      await signOut()
      // Redirect to your desired page
      // router.replace('/(auth)/home')
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

        <AlertDialogContent>
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
            <Button
              variant="outline"
              action="secondary"
              onPress={handleClose}
              size="md"
            >
              <ButtonText>Cancelar</ButtonText>
            </Button>

            <Button size="md" onPress={handleSignOut} className="bg-red-600 data-[active=true]:bg-red-800">
              <ButtonText>Sair</ButtonText>
            </Button>
          </AlertDialogFooter>

        </AlertDialogContent>
      </AlertDialog>
    )
  }

  return (
    <>
      <Button variant='outlined' size='xl' className='w-full bg-transparent rounded-full border border-red-500 transition data-[active=true]:bg-neutral-700 disabled:bg-primary-black' onPress={() => setMostrarDialogConfirmacao(true)}>
        <ButtonText className='text-white'>Sair</ButtonText>
      </Button>
      <DialogConfirmarSair />
    </>


  )
}

export default SignOutButton;