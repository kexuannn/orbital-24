import { View, Text, ScrollView, Image, Alert } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router, Link } from 'expo-router'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { doc, setDoc, collection} from "firebase/firestore"

import { images } from "../../constants";
import FormField from '../../components/FormField';
import EmailButton from '../../components/EmailButton';
import { auth, db } from '../../firebase.config';
import validEmails from '../../components/allowedShelters';

const SignUp = () => {
    const [form, setForm] = useState({
        email: '',
        password: '',
    })

    const [isSubmitting, setIsSubmitting] = useState(false)

    const submit = async () => {
        
        setIsSubmitting(true);

        try {
            if (!validEmails.includes(form.email)) {
                const { user } = await createUserWithEmailAndPassword(auth, form.email, form.password);
                const userDocRef = doc(collection(db, "users"), user.uid);
                await setDoc(userDocRef, {
                    email: user.email,
                });
                router.push({ pathname: '/user', params: { email: form.email }});
            } else {
                Alert.alert('Verified shelter email!', 'Please sign up as a shelter instead.');
            }    
        } catch (error) {
            setIsSubmitting(false);
            console.error('Error signing up:', error.code, error.message);
            if (error.code === 'auth/invalid-email') {
                Alert.alert("Invalid email format", "Please enter a valid email address.");
            } else if (error.code == 'auth/email-already-in-use') {
                Alert.alert("Email already exists", "Try another email.")
            } else if (error.code == 'auth/weak-password') {
                Alert.alert("Invalid password", "Password needs to be longer than 6 characters.")
            } else {
                Alert.alert("Sign Up Error", "Please try again.")
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <SafeAreaView className="bg-bgc h-full">
            <ScrollView>

                <View className="w-full h-full justify-center px-4 py-10">
                    <Image
                        source={images.logo}
                        className={"w-[190px] h-[160px]"}
                        resizeMode='contain'
                    />

                    <Text className="text-darkBrown text-2xl font-psemibold">Sign up as a {''}
                        <Text className="text-red text-2xl font-psemibold">User</Text>
                        <Text className="text-darkBrown text-2xl font-psemibold">:</Text>
                    </Text>


                    <View className="justify-left pt-5 flex-row gap-1">
                        <Text className="text-lg text-turqoise font-pregular">Are you a shelter?</Text>
                        <Link href="/shelteruser" className=" underline text-lg text-red font-pregular">Sign up here instead!</Link>

                    </View>

                    <FormField
                        title="Email"
                        value={form.email}
                        handleChangeText={(e) => setForm({...form, email: e})}
                        otherStyles="mt-7"
                        keyboardType="email-address"
                    />

                    <FormField
                        title="Password"
                        value={form.password}
                        handleChangeText={(e) => setForm({...form, password: e})}
                        otherStyles="mt-7"
                    />

                    <EmailButton
                        title="Sign up"
                        handlePress={submit}
                        containerStyles="mt-7 bg-turqoise"
                        isLoading={isSubmitting}
                    />

                    <View className="justify-center pt-5 flex-row gap-1">
                        <Text className="text-md text-turqoise font-plight">Already have an account?</Text>
                        <Link href="/sign-in" className=" underline text-md text-red font-plight">Sign in here!</Link>

                    </View>

                </View>
            </ScrollView>
        </SafeAreaView>
    )
}

export default SignUp