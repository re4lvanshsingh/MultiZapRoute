import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { FlatList } from 'react-native';
import { TouchableOpacity } from 'react-native';
import { Icon } from 'react-native-elements';
import tw from 'twrnc'
import {handleButtonPress} from '../screens/HomeScreen.js'

const data = [
    {
        id: "113",
        icon: "home",
        location: "Home",
        destination: "Code Street, London, UK"
    },
    {
        id: "435",
        icon: "briefcase",
        location: "Work",
        destination: "London Eye, London, UK"
    },
    {
        id: "425",
        icon: "cafe",
        location: "Cafe",
        destination: "Kennington, London, UK"
    }
];

const NavFavourites = ({onChange}) => {
    
  return (
    <FlatList
        data={data}
        keyExtractor={(item)=>item.id}
        ItemSeparatorComponent={()=>(
            <View
                style={[tw `bg-gray-200`, {height: 0.5}]}
            />
        )}
        renderItem={({item: {location, destination, icon}})=>(
            <TouchableOpacity style={tw `flex-row items-center p-5`}
            onPress={onChange}
            >
               <Icon
                style={tw `mr-4 rounded-full bg-gray-300 p-3`}
                name={icon}
                type="ionicon"
                colors="white"
                size={18}
               /> 
               <View>
                    <Text style={tw `font-semibold text-lg`}>{location}</Text>
                    <Text style={tw `text-gray-500`}>{destination}</Text>
               </View>
            </TouchableOpacity>
        )}
    />
  )
}

export default NavFavourites

const styles = StyleSheet.create({})