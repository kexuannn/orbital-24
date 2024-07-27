import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Image, ActivityIndicator, FlatList, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute } from '@react-navigation/native';
import { db } from '../../firebase.config';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import CustomDeletePostButton from '../../components/CustomDeletePostButton';

const UserProfile = () => {
  const route = useRoute();
  const { userId } = route.params;
  const [userPosts, setUserPosts] = useState([]);
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchUserDataAndPosts = useCallback(async () => {
    try {
      // Fetch user data
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        setUsername(userDoc.data().username);
      } else {
        console.error('User not found');
      }

      // Fetch user posts
      const postsQuery = query(collection(db, 'posts'), where('userId', '==', userId));
      const snapshot = await getDocs(postsQuery);
      const postsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Sort posts by createdAt timestamp
      const sortedPosts = postsData.sort((a, b) => b.createdAt?.toDate() - a.createdAt?.toDate());

      setUserPosts(sortedPosts);
    } catch (error) {
      console.error('Error fetching user data or posts:', error);
    } finally {
      setLoading(false);
      setRefreshing(false); // Stop refreshing animation
    }
  }, [userId]);

  useEffect(() => {
    fetchUserDataAndPosts();
  }, [fetchUserDataAndPosts]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchUserDataAndPosts();
  };

  if (loading) {
    return (
      <SafeAreaView className="bg-bgc h-full justify-center items-center">
        <ActivityIndicator size="large" color="grey" />
      </SafeAreaView>
    );
  }

  if (userPosts.length === 0) {
    return (
      <SafeAreaView className="bg-bgc h-full justify-center items-center">
        <Text>No posts found</Text>
      </SafeAreaView>
    );
  }

  const renderItem = ({ item }) => (
    <View key={item.id} className="bg-white mt-2 p-4 rounded-lg shadow-md ml-4 mr-4">
      <Image
        source={{ uri: item.imageUrl }}
        style={{ width: '100%', height: 400, borderRadius: 10 }}
      />
      <Text className="text-darkBrown font-plight text-lg mt-2">
        {item.caption}
      </Text>
      <Text className="text-gray-500 text-sm mt-2">
        {new Date(item.createdAt?.toDate()).toLocaleString()}
      </Text>
      <CustomDeletePostButton
        collectionName="posts"
        docId={item.id}
      />
    </View>
  );

  return (
    <SafeAreaView className="bg-bgc h-full">
      <View className="p-4">
        <Text className="text-darkBrown text-2xl font-pbold text-center">{username}</Text>
      </View>
      <FlatList
        data={userPosts}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#0000ff']} // Optional: Customize the refresh indicator color
          />
        }
      />
    </SafeAreaView>
  );
};

export default UserProfile;
