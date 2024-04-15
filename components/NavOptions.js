import { Text, View, FlatList, TouchableOpacity, Image } from 'react-native'
import React from 'react'
import tw from 'twrnc'
import { Icon } from 'react-native-elements';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { selectOrigin, setDestination,selectVisitOrder } from '../slices/navSlice';

const data = [
    {
        id: "123",
        title: "Get Best Route",
        image: "https://links.papareact.com/3pn",
        screen: "MapScreen"
    }
];

const NavOptions = ({sendDataToBackend,textInputs}) => {
    const navigation = useNavigation();
    const visitorder = useSelector(selectVisitOrder);

    const combine = async () =>{
        await sendDataToBackend();
        navigation.navigate("MapScreen");
    }

    const checker = () => {
        return textInputs.every(({ latitude }) => latitude !== '');
    };

  return (
    <TouchableOpacity
            onPress={combine}
            disabled={!textInputs.length || (textInputs.length>=1 && !checker())}
            >
                <View style={tw `${(!textInputs.length || (textInputs.length>=1 && !checker())) && "opacity-20"}`}>
                    <Icon
                    style={tw `rounded-full`}
                    name="chevron-forward-circle-outline"
                    type="ionicon"
                    colors="white"
                    size={80}
                /> 
                </View>
            </TouchableOpacity>
  )
}

export default NavOptions;