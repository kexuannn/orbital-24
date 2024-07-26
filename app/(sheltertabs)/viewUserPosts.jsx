import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Image, RefreshControl, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import LikeButton from '../../components/CustomLikeButton';
import HorizontalBar from '../../components/CustomHorizontalBar';
import { db } from '../../firebase.config';
import { doc, getDocs, collection } from 'firebase/firestore';

const { width: screenWidth } = Dimensions.get('window');

const viewUserPosts = () => {
  const router = useRouter();
  const [posts, setPosts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const postsCollection = collection(db, 'posts');
      const snapshot = await getDocs(postsCollection);
      const postsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        data: doc.data(),
      }));
      setPosts(postsData);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPosts();
    setRefreshing(false);
  };

  const navigationData = [
    {
      id: '1',
      title: 'Pet Listing',
      screen: 'shelterHome',
    },
    {
      id: '2',
      title: 'Fundraising Events',
      screen: 'fundraising',
    },
    {
      id: '3',
      title: 'Success Stories',
      screen: 'successStories',
    },
    {
      id: '4',
      title: 'User Posts',
      screen: 'viewUserPosts',
    },
  ];

  return (
    <SafeAreaView className="bg-bgc h-full">
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View className="w-full h-full justify-start px-4 py-10">
          <View className="justify-start flex-center items-center">
            <Text className="text-turqoise font-gb mt-4 text-5xl mb-4">
              Users' Posts
            </Text>
          </View>

          <HorizontalBar data={navigationData} />

          {posts.reverse().map((post) => (
            <View key={post.id} className="bg-white mt-2">
              <View className="justify-start items-start mt-2">
                <View className="flex-row justify-center items-center ml-2">
                  <Image
                    source={{ uri: post.data.profilePicture }}
                    style={{
                      width: 40,
                      height: 40,
                      resizeMode: 'contain',
                      borderRadius: 20,
                    }}
                  />
                  <TouchableOpacity
                    onPress={() => router.push({ pathname: 'userProfile', params: { userId: post.data.userId } })}
                  >
                    <Text className="text-turqoise font-pbold text-lg ml-2">
                      {post.data.username}
                    </Text>
                  </TouchableOpacity>
                </View>

                <View className='mt-2 mb-2'>
                  <Image
                    source={{ uri: post.data.imageUrl }}
                    style={{
                    width: screenWidth - 32, // Width of the screen minus padding
                    height: (screenWidth - 32), // Maintain aspect ratio
                    resizeMode: 'cover',
                    marginVertical: 10,
                    }}
                  />
                </View>

                <View className='mb-2 ml-2'>
                  <LikeButton postId={post.id} collectionName={"posts"} initialLikes={(post.data.likedBy && post.data.likedBy.length) || 0} />
                </View>

                <View className="flex flex-row ml-2 items-center mb-2">
                  <TouchableOpacity
                    onPress={() => router.push({ pathname: 'userProfile', params: { userId: post.data.userId } })}
                  >
                    <Text className="text-turqoise font-pbold text-lg">
                      {post.data.username}
                    </Text>
                  </TouchableOpacity>
                  <Text className="text-darkBrown font-pregular text-lg ml-3">
                    {post.data.caption}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default viewUserPosts;