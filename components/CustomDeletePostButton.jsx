import React from 'react';
import { TouchableOpacity, Text, Alert } from 'react-native';
import { auth, db } from '../firebase.config';
import { doc, deleteDoc } from 'firebase/firestore';

const DeleteButton = ({ collectionName, docId, containerStyles, textStyles, isLoading }) => {
  const handleDelete = async () => {
    Alert.alert(
      'Confirm Deletion',
      'Are you sure you want to delete this item?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'OK',
          onPress: async () => {
            try {
              const docRef = doc(db, collectionName, docId);
              await deleteDoc(docRef);
              Alert.alert('Success', 'Document deleted successfully.');
            } catch (error) {
              console.error('Error deleting document:', error);
              Alert.alert('Error', 'Failed to delete document.');
            }
          }
        }
      ]
    );
  };

  return (
    <TouchableOpacity
      onPress={handleDelete}
      activeOpacity={0.7}
      className={`bg-red-600 rounded-xl min-h-[40px] justify-center items-center ${containerStyles} ${isLoading ? 'opacity-50' : ''}`}
      disabled={isLoading}
    >
      <Text className={`${textStyles}`}>Delete</Text>
    </TouchableOpacity>
  );
};

export default DeleteButton;
