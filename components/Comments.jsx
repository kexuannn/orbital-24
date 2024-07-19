import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList } from 'react-native';
import { auth, db } from '../../firebase.config';
import { collection, addDoc, query, where, getDocs, serverTimestamp } from 'firebase/firestore';

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

      const commentsCollection = collection(db, 'success', postId, 'comments');
      await addDoc(commentsCollection, {
        userId: user.uid,
        username: user.displayName,
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

  return (
    <View>
      <FlatList
        data={comments}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View className="mt-2 mb-2 ml-2">
            <Text className="text-darkBrown font-pbold text-lg">{item.data.username}</Text>
            <Text className="text-darkBrown font-pregular text-lg">{item.data.commentText}</Text>
          </View>
        )}
      />
      <TextInput
        value={newComment}
        onChangeText={setNewComment}
        placeholder="Add a comment..."
        className="border border-gray-300 rounded p-2 mt-2"
      />
      <Button title="Post Comment" onPress={handleAddComment} />
    </View>
  );
};

export default CommentSection;
