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
          name='home'
          options={{
            title:'home',
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
          name='search'
          options={{
            title:'search',
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                icon = {icons.search}
                color = {color}
                focused = {focused}
              />
            )
          }}
        /> 

        <Tabs.Screen
          name='create'
          options={{
            title:'create',
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
          name='livechatlist'
          options={{
            title:'livechatlist',
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
          name='user'
          options={{
            title:'user',
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
          name='viewhome'
          options={{
            title: 'viewhome',
            href: null,
            headerShown: false,
          }}
        />

        <Tabs.Screen
          name='viewfundraising'
          options={{
            title: 'viewfundraising',
            href: null,
            headerShown: false,
          }}
        />

        <Tabs.Screen
          name='viewsuccess'
          options={{
            title: 'viewsuccess',
            href: null,
            headerShown: false,
          }}
        />

        <Tabs.Screen
          name='searchResults'
          options={{
            title: 'searchResults',
            href: null,
            headerShown: false,
          }}
        />

        <Tabs.Screen
          name='livechat'
          options={{
            title: 'livechat',
            href: null,
            headerShown: false,
          }}
        />

        <Tabs.Screen
          name='filter'
          options={{
            title: 'filter',
            href: null,
            headerShown: false,
          }}
        />

        
      </Tabs>
      
    </>
  )
}

export default TabsLayout