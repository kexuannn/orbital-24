import { View, Text } from 'react-native'
import { Stack } from 'expo-router'

const OthersLayout = () => {
  return (
    <>
      <Stack>
        <Stack.Screen
          name='bookmarked'
          options={{
            headerShown: false
          }}
        />
      </Stack>
    </>
  )
}

export default OthersLayout