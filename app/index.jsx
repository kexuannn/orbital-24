import { StatusBar } from "expo-status-bar";
import { Text, View, Image, ScrollView } from "react-native";
import { Redirect, router } from 'expo-router';
import { SafeAreaView } from "react-native-safe-area-context";

import { images } from "../constants";
import EmailButton from "../components/EmailButton";

export default function App() {
    return (
        <SafeAreaView className="bg-bgc h-full">
            <ScrollView contentContainerStyle={{ height: '100%'}}>
                <View className="w-full min-h-[85vh] justify-center items-center px-4">
                    <Image
                        source={images.logo}
                        className={"w-[200px] h-[100px]"}
                        resizeMode='contain'
                    />

                    <Image
                        source={images.pets}
                        className={"w-[400px] h-[200px]"}
                        resizeMode='contain'
                    />
                        
                    <View className="relative mt-3">
                        <Text className="text-6xl text-darkBrown font-gb text-center px-3">Welcome to the {' '}
                            <Text className="text-turqoise font-gb">PawsConnect {''}</Text> 
                            <Text>family!</Text>
                        </Text>
                    </View>

                    <EmailButton
                        title="Sign in"
                        handlePress={() => router.push('/sign-in')}
                        containerStyles="w-full mt-7"
                    />

                </View>
            </ScrollView>
        </SafeAreaView>
    );
}