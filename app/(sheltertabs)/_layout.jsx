import { StatusBar } from "expo-status-bar";
import { Redirect, Tabs } from "expo-router";
import { Image, Text, View } from "react-native";


import { icons } from "../../constants";

const TabIcon = ( { icon, color, name, focused }) => {
  return (
    <View className="flex items-center justify-center gap-2">
      <Image
        source={icon}
        resizeMode='contain'
        tintColor={color}
        className="w-6 h-6"
      />
      
      <Text 
        className={`${focused ? 'font-psemibold' : 'font-pregular'} text-xs`}
        style={{ color: color }}
      >
        {name}
      </Text>
    </View>
  )
}

const TabsLayout = () => {
  return (
    <>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: "#416F82",
          tabBarInactiveTintColor: "#463939",
          tabBarShowLabel: false,
          tabBarStyle: {
            backgroundColor: "white",
            height: 100,
          }
        }}
      >
        <Tabs.Screen
          name='shelterHome'
          options={{
            title:'shelterHome',
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                icon = {icons.home}
                color = {color}
                focused = {focused}
              />
            )
          }}
        /> 

        <Tabs.Screen
          name='shelterCreate'
          options={{
            title:'shelterCreate',
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                icon = {icons.plus}
                color = {color}
                focused = {focused}
              />
            )
          }}
        /> 

        <Tabs.Screen
          name='shelterLivechat'
          options={{
            title: 'shelterLivechat',
            href: null,
            headerShown: false,
          }}
        />

        <Tabs.Screen
          name='shelterLiveChatList'
          options={{
            title:'shelterLiveChatList',
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon 
                icon = {icons.livechat}
                color = {color}
                focused = {focused}
              />
            )
          }}
        /> 

        <Tabs.Screen
          name='shelterProfile'
          options={{
            title:'shelterProfile',
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                icon = {icons.profiletab}
                color = {color}
                focused = {focused}
              />
            )
          }}
        />

        <Tabs.Screen
          name='fundraising'
          options={{
            title: 'fundraising',
            href: null,
            headerShown: false,
          }}
        />

        <Tabs.Screen
          name='successStories'
          options={{
            title: 'successStories',
            href: null,
            headerShown: false,
          }}
        />

        <Tabs.Screen
          name='viewUserPosts'
          options={{
            title: 'viewUserPosts',
            href: null,
            headerShown: false,
          }}
        />

        <Tabs.Screen
          name='userProfile'
          options={{
            title: 'userProfile',
            href: null,
            headerShown: false,
          }}
        />

      </Tabs>
    </>
  )
}

export default TabsLayout