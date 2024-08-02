import { Text, View, Image, ScrollView } from "react-native";
import { useRouter } from 'expo-router';
import { SafeAreaView } from "react-native-safe-area-context";
import { images } from "../constants";
import EmailButton from "../components/EmailButton";
import { registerRootComponent } from "expo";
import { ExpoRoot } from "expo-router";

function MainApp() {
    const router = useRouter();

    return (
        <SafeAreaView className="bg-bgc h-full">
            <ScrollView contentContainerStyle={{ height: '100%' }}>
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
                        <Text className="text-6xl text-darkBrown font-gb text-center px-3">
                            Welcome to the {' '}
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

function RootApp() {
    const ctx = require.context("./src/app", true, /\.(js|ts|tsx)$/);
    return <ExpoRoot context={ctx} />;
}

// Register the root component
registerRootComponent(RootApp);

export default MainApp;
