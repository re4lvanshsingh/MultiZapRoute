import { StyleSheet, View } from 'react-native'
import React,{useState,useEffect} from 'react'
import tw from 'twrnc'
import Map from '../components/Map.js'
import NetInfo from "@react-native-community/netinfo";
import OfflineNotification from '../components/Offline.js';
import Directions from '../components/Directions.js'

const MapScreen = () => {
    const [isConnected, setIsConnected] = useState(true);

    useEffect(() => {
        // Subscribe to network state changes
        const unsubscribe = NetInfo.addEventListener(state => {
            setIsConnected(state.isConnected);
        });

        // Don't forget to unsubscribe when component unmounts
        return () => {
            unsubscribe();
        };
    }, []);

  return (
    <View>
      <View style={tw `h-1/2`}>
        <Map/>
      </View>
      
      <View style={tw `h-1/2`}>
            <Directions/>

            {/* For checking the connection - if we are connected or not */}
            {!isConnected && <OfflineNotification/>}
      </View>
    </View>
  )
}

export default MapScreen

const styles = StyleSheet.create({})