import { StyleSheet, Text, View, SafeAreaView, FlatList } from 'react-native'
import React,{useRef} from 'react'
import tw from 'twrnc'
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete'
import { useDispatch } from 'react-redux'
import { setDestination } from '../slices/navSlice'
import { useNavigation } from '@react-navigation/native'
import { GOOGLE_MAPS_APIKEY } from '@env'
import {RideOptionsCard} from './RideOptionsCard.js'
import { TouchableOpacity } from 'react-native'
import { Icon } from 'react-native-elements'
import { FavouriteLocations } from '../db/FavouriteLocations.js'

const NavigateCard = () => {
    const dispatcher = useDispatch();
    const navigation = useNavigation();

    const autocompleteRef = useRef(null);

    const handleButtonPress = ({destination,data,details}) => {
        // Set the location value programmatically
        autocompleteRef.current.setAddressText(destination);
        dispatcher(setDestination({
            location: details,
            description: data
        }));
      };

  return (
    <SafeAreaView style={tw `bg-white flex-1`}>
      <Text style={tw `text-center py-5 text-xl`}>Destination</Text>
      <View style={tw `border-t border-gray-200 flex-shrink`}>
        <View>
            <GooglePlacesAutocomplete
                ref={autocompleteRef}
                styles={toInputBoxStyles}
                placeholder='Where To?'
                fetchDetails={true}
                onPress={(data,details=null)=>{
                    dispatcher(
                        setDestination({
                            location: details.geometry.location,
                            description: data.description,
                        })
                    )
                }}
                enablePoweredByContainer={false}
                query={{
                    key: GOOGLE_MAPS_APIKEY,
                    language: "en"
                }}

                nearbyPlacesAPI='GooglePlacesSearch'
                debounce={400}
            />
        </View>

        <FlatList
                data={FavouriteLocations}
                keyExtractor={(item)=>item.id}
                ItemSeparatorComponent={()=>(
                    <View
                        style={[tw `bg-gray-200`, {height: 0.5}]}
                    />
                )}
                renderItem={({item: {location, destination, icon, data, details}})=>(
                    <TouchableOpacity style={tw `flex-row items-center p-5`}
                        onPress={()=>handleButtonPress({destination,data,details})}
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
      </View>

      <View style={tw `flex-row bg-white justify-evenly py-2 mt-auto border-t border-gray-100`}>
        <TouchableOpacity 
        onPress={()=>navigation.navigate('RideOptionsCard')}
        style={tw `flex flex-row justify-between bg-black w-24 px-4 py-3 rounded-full`}>
            
            <Icon name="car" type="font-awesome" color="white" size={16}/>
            <Text style={tw `text-white text-center`}>Rides</Text>
        
        </TouchableOpacity>
        
        <TouchableOpacity style={tw `flex flex-row justify-between w-24 px-4 py-3 rounded-full bg-black`}>
            
            <Icon name="fast-food-outline" type="ionicon" color="white" size={16}/>
            <Text style={[tw `text-center`, { color: 'white' }]}>Eats</Text>
        
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

export default NavigateCard

const toInputBoxStyles = StyleSheet.create({
    container: {
        backgroundColor: "white",
        paddingTop: 20,
        flex: 0,
    },

    textInput: {
        backgroundColor: "#DDDDDF",
        borderRadius: 0,
        fontSize: 18,
    },

    textInputContainer: {
        paddingHorizontal: 20,
        paddingBottom: 0
    }
})