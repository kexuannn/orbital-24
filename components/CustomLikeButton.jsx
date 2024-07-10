import React, { useState, useEffect } from 'react';
import { TouchableOpacity, Text, View } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { getAuth } from 'firebase/auth';
import { doc, updateDoc, arrayUnion, arrayRemove, getDoc } from 'firebase/firestore';
import { db } from '../firebase.config';

const LikeButton = ({ postId, collectionName, initialLikes }) => {
  const auth = getAuth();
  const currentUser = auth.currentUser;

  const [likes, setLikes] = useState(initialLikes || 0); 
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    if (currentUser) {
      checkIfLiked();
    }
  }, [currentUser]);

  const checkIfLiked = async () => {
    try {
      const postRef = doc(db, collectionName, postId);
      const postSnap = await getDoc(postRef);
  
      if (postSnap.exists()) {
        const postData = postSnap.data();
        
        setLiked(postData.likedBy && postData.likedBy.includes(currentUser.uid));
      } else {
        console.log("Document does not exist");
      }
    } catch (error) {
      console.error("Error fetching document:", error);
    }
  };

  const handleLike = async () => {
    if (!currentUser) {
      return;
    }

    const postRef = doc(db, collectionName, postId);
    const postSnap = await getDoc(postRef);
    if (!postSnap.exists()) {
      console.error("Post does not exist!");
      return;
    }

    const postData = postSnap.data();
    if (liked) {
      // Unlike the post
      await updateDoc(postRef, {
        likedBy: arrayRemove(currentUser.uid),
      });
      setLikes(prevLikes => prevLikes - 1); // Update likes state
      setLiked(false);
    } else {
      // Like the post
      await updateDoc(postRef, {
        likedBy: arrayUnion(currentUser.uid),
      });
      setLikes(prevLikes => prevLikes + 1); // Update likes state
      setLiked(true);
    }
  };

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <TouchableOpacity onPress={handleLike}>
        <FontAwesome name="heart" size={24} color={liked ? 'red' : 'gray'} />
      </TouchableOpacity>
      <Text style={{ marginLeft: 5, fontSize: 16 }}>{likes} likes</Text>
    </View>
  );
};

export default LikeButton;
