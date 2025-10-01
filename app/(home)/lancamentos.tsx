import { Heading } from '@/components/ui/heading'
import { View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Lancamentos() {
  return (
    <SafeAreaView edges={['top']} className='flex-1 items-center justify-start gap-4 p-4 bg-black'>
      <View className='flex-1 items-center justify-center gap-4 py-4 bg-black'>
        <Heading size='4xl'>Lançamentos</Heading>
      </View>

      <View className='items-center justify-center gap-6 py-12 w-full'>
        <Text className='text-white text-lg'>Próximas sprints...</Text>
      </View>
    </SafeAreaView>
  )
}