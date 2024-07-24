/*import React, { useState } from 'react';
import { View, Text, TextInput, Button, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute } from '@react-navigation/native';
import { useStripe } from '@stripe/stripe-react-native';

const donate = () => {
  const route = useRoute();
  const { shelterId } = route.params;
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchPaymentSheetParams = async () => {
    try {
      const response = await fetch('http://10.231.116.245:3000/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const { clientSecret } = await response.json();
      return { clientSecret };
    } catch (error) {
      console.error('Error fetching payment sheet parameters:', error);
      throw error;
    }
  };

  const initializePaymentSheet = async () => {
    try {
      const { clientSecret } = await fetchPaymentSheetParams();

      const { error } = await initPaymentSheet({
        paymentIntentClientSecret: clientSecret,
        returnURL: 'PawsConnect://stripe-redirect', // Update this to your actual URL scheme
      });

      if (!error) {
        setLoading(true); // Update state only if no error
      } else {
        console.error('Error initializing payment sheet:', error);
      }
    } catch (error) {
      console.error('Error initializing payment sheet:', error);
    }
  };

  const openPaymentSheet = async () => {
    try {
      const { error } = await presentPaymentSheet();

      if (error) {
        alert(`Error: ${error.message}`);
      } else {
        alert('Success! Your donation was confirmed.');
      }
    } catch (error) {
      console.error('Error presenting payment sheet:', error);
    }
  };

  const handleDonate = async () => {
    setLoading(true); // Start loading indicator
    try {
      await initializePaymentSheet(); // Ensure initialization is done
      if (loading) {
        await openPaymentSheet(); // Present the payment sheet only if it's properly initialized
      } else {
        alert('Payment sheet could not be initialized');
      }
    } finally {
      setLoading(false); // Stop loading indicator regardless of success or failure
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <View style={{ width: '80%', maxWidth: 400 }}>
        <Text style={{ fontSize: 24, marginBottom: 20 }}>Donate to Shelter</Text>
        <TextInput
          placeholder="Enter amount"
          keyboardType="numeric"
          value={amount}
          onChangeText={setAmount}
          style={{
            borderColor: '#ccc',
            borderWidth: 1,
            borderRadius: 4,
            padding: 10,
            marginBottom: 20,
          }}
        />
        {loading ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : (
          <Button
            title="Donate"
            onPress={handleDonate}
            disabled={!amount || loading}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

export default donate;*/
