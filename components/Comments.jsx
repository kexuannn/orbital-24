import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity } from 'react-native';
import { auth, db } from '../firebase.config';
import { collection, addDoc, getDocs, getDoc, doc, deleteDoc, serverTimestamp } from 'firebase/firestore';

const CommentSection = ({ postId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const commentsCollection = collection(db, 'success', postId, 'comments');
        const snapshot = await getDocs(commentsCollection);
        const commentsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          data: doc.data(),
        }));
        setComments(commentsData);
      } catch (error) {
        console.error('Error fetching comments:', error);
      }
    };

    fetchComments();
  }, [postId]);

  const handleAddComment = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      let username = user.displayName;
      if (!username) {
        // Check in 'users' collection
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          username = userDocSnap.data().username || 'Unknown';
        } else {
          // If not found, check in 'shelters' collection
          const shelterDocRef = doc(db, 'shelters', user.uid);
          const shelterDocSnap = await getDoc(shelterDocRef);
          if (shelterDocSnap.exists()) {
            username = shelterDocSnap.data().username || 'Unknown';
          } else {
            username = 'Unknown';
          }
        }
      }

      const commentsCollection = collection(db, 'success', postId, 'comments');
      await addDoc(commentsCollection, {
        userId: user.uid,
        username,
        profilePicture: user.photoURL,
        commentText: newComment,
        timestamp: serverTimestamp(),
      });

      setNewComment('');
      // Refetch comments
      const snapshot = await getDocs(commentsCollection);
      const commentsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        data: doc.data(),
      }));
      setComments(commentsData);

    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const commentDocRef = doc(db, 'success', postId, 'comments', commentId);
      await deleteDoc(commentDocRef);
      
      // Refetch comments
      const commentsCollection = collection(db, 'success', postId, 'comments');
      const snapshot = await getDocs(commentsCollection);
      const commentsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        data: doc.data(),
      }));
      setComments(commentsData);
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  return (
    <View>
      <FlatList
        data={comments}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View className="mb-2 ml-2">
            <Text className="ml-1 text-darkBrown font-pbold text-med">{item.data.username}</Text>
            <View className='flex-row justify-between items-center'>
              <Text className="text-darkBrown font-pregular text-med flex-grow ml-2">{item.data.commentText}</Text>
              {item.data.userId === auth.currentUser?.uid && (
                <TouchableOpacity onPress={() => handleDeleteComment(item.id)}>
                  <Text className="text-red underline mr-4">Delete</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
      />

      <View className="flex-row items-center p-2 border-darkBrown">
        <TextInput
            value={newComment}
            onChangeText={setNewComment}
            placeholder="Add a comment..."
            placeholderTextColor='#416F82'
            className="flex-1 h-10 border border-darkBrown px-3 rounded color-darkBrown font-plight"
        />
        <TouchableOpacity
            className="ml-2 px-4 py-2 bg-turqoise rounded"
            onPress={handleAddComment}
        >
            <Text className="text-white font-plight">Post comment</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default CommentSection;
