import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Image, RefreshControl, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import EmailButton from '../../components/EmailButton';
import LikeButton from '../../components/CustomLikeButton';
import CustomWebsiteButton from '../../components/CustomWebsiteButton';
import { db } from '../../firebase.config';
import { doc, getDocs, collection } from 'firebase/firestore';

const { width: screenWidth } = Dimensions.get('window');

const Home = () => {
  const router = useRouter();
  const [shelters, setShelters] = useState([]);
  const [posts, setPosts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchShelters();
    fetchPosts();
  }, []);
  

  const fetchShelters = async () => {
    try {
      const sheltersCollection = collection(db, 'shelters');
      const snapshot = await getDocs(sheltersCollection);
      const shelterData = snapshot.docs.map((doc) => ({
        id: doc.id,
        data: doc.data(),
      }));
      setShelters(shelterData);
    } catch (error) {
      console.error('Error fetching shelters:', error);
    }
  };

  const fetchPosts = async () => {
    try {
      const postsCollection = collection(db, 'posts');
      const snapshot = await getDocs(postsCollection);
      const postsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        data: doc.data(),
      }));
  
      postsData.sort((a, b) => {
        const dateA = a.data.createdAt.toDate(); 
        const dateB = b.data.createdAt.toDate(); 
        return dateB - dateA; 
      });
  
      setPosts(postsData);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  const formatDate = (timestamp) => {
    if (timestamp) {
      const date = timestamp.toDate(); 
      return date.toLocaleDateString('en-US', { 
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
    return 'No Date'; 
  };
  

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchShelters();
    await fetchPosts();
    setRefreshing(false);
  };

  return (
    <SafeAreaView className="bg-bgc h-full">
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View className="w-full h-full justify-start px-4 py-10">
          <View className="justify-start flex-center items-center justify-center">
            <Text className="text-turqoise font-gb mt-4 text-5xl mb-4 ">
              Home
            </Text>
          </View>

          <View className="flex-row justify-center items-center border-b border-turqoise">
            <Text className="flex-1 text-center text-2xl font-plight text-turqoise mr-5">
              Profile
            </Text>
            <Text className="flex-1 text-center text-2xl font-plight text-turqoise">
              Website
            </Text>
          </View>

          {shelters.map((shelter) => (
            <View key={shelter.id}>
              <View className="justify-center flex-row mt-4">
                <EmailButton
                  title={shelter.data.username}
                  containerStyles="bg-darkBrown p-3 rounded-xl w-1/2 mr-3"
                  textStyles="text-center"
                  handlePress={() =>
                    router.push({ pathname: 'viewhome', params: { id: shelter.id }})
                  }
                />

                <CustomWebsiteButton
                  title={`Visit ${shelter.data.username}'s website here!`}
                  url={shelter.data.website}
                  containerStyles="bg-darkBrown p-3 rounded-xl w-1/2"
                />
              </View>
            </View>
          ))}

          <EmailButton
            title="View map of shelters here!"
            containerStyles="bg-turqoise rounded-xl mt-4"
            textStyles="text-center"
            handlePress={() =>
            router.push({ pathname: 'maps'})
            }
          />
          
          <View className="border-turqoise border-b mt-6 mb-4"></View>

          

          <Text className="text-xl font-plight text-turqoise">Posts for you:</Text>

          {posts.map((post) => (
            <View key={post.id} className="bg-white mt-4">
              <View className="justify-start items-start mt-2">

                <View className="flex-row justify-center items-center ml-2 ">
                  <Image
                    source={{ uri: post.data.profilePicture }}
                    style={{
                      width: 40,
                      height: 40,
                      resizeMode: 'contain',
                      borderRadius: 20,
                    }}
                  />
                  <Text className="text-turqoise font-pbold text-lg ml-2 ">
                    {post.data.username}
                  </Text>
                </View>

                <View className= 'mb-2'>
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

                <View className='mb-2 mx-2 mt-1'>
                  <LikeButton postId={post.id} collectionName={"posts"} initialLikes={(post.data.likedBy && post.data.likedBy.length) || 0} />
                </View>

                <View className='ml-2 mb-2'>
                  <Text className='text-turqoise font-pbold text-lg'>
                    {post.data.username}
                  </Text>
                  <Text className='text-darkBrown font-pregular text-md ml-3 flex-wrap' style={{ maxWidth: screenWidth - 32 }}>
                    {post.data.caption}
                  </Text>
                </View>
                <Text className="text-darkBrown font-pregular text-xs ml-2 mb-2">
                    Posted on: {formatDate(post.data.createdAt)}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Home;
