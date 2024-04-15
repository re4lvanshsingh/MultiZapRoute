import { StyleSheet, Text, View, Button, SafeAreaView,Animated, TouchableOpacity } from 'react-native'
import React, { useEffect,useRef,useState } from 'react'
import { BottomSheet, BottomSheetFlatList } from '@gorhom/bottom-sheet'; // Import BottomSheet
import MapView, {Marker} from 'react-native-maps'
import tw from 'twrnc'
import {useSelector } from 'react-redux'
import {selectVisitOrder} from "../slices/navSlice.js"
import MapViewDirections from 'react-native-maps-directions'
import { GOOGLE_MAPS_APIKEY } from '@env'

const Map = () => {
    let tsp=useSelector(selectVisitOrder);

    // console.log(tsp);
    let maxlat = -90;
    let maxlong = -180;

    let minlat = 90;
    let minlong = 180;

    //For using Google Cloud Distance Matrix
    let tspPairs = [];
    for (let i = 0; i < tsp.length; i++) {
        tspPairs.push([]);

        for (let j = 0; j < tsp[i]["Nodes"].length - 1; j++) {
            let current=Object.assign({},tsp[i]["Nodes"][j]);
            let next=Object.assign({},tsp[i]["Nodes"][j+1]);

            // console.log('Current:', current);
            // console.log('Next:', next);
            current['Color']=tsp[i]["color"];
            next['Color']=tsp[i]["color"];

            maxlat = Math.max(maxlat, Number(current["Latitude"]), Number(next["Latitude"]));
            minlat = Math.min(minlat, Number(current["Latitude"]), Number(next["Latitude"]));
            maxlong = Math.max(maxlong, Number(current["Longitude"]), Number(next["Longitude"]));
            minlong = Math.min(minlong, Number(current["Longitude"]), Number(next["Longitude"]));


            tspPairs[i].push({ current, next });
        }
    }

    console.log("Lat1: ",maxlat);
    console.log("Lat2: ",maxlong);
    // console.log(tspPairs);

    const mapRef=useRef(null);

    // Animation:
    useEffect(()=>{
        if(!maxlat || !maxlong)return;

        //Fit to the markers:
        mapRef.current.animateToRegion({
            latitude: (maxlat + minlat) / 2,
            longitude: (maxlong + minlong) / 2,
            latitudeDelta: Math.abs(maxlat - minlat) * 1.2,
            longitudeDelta: Math.abs(maxlong - minlong) * 1.2,
        });
          
    },[maxlat,minlong,maxlat,minlong]);

    //To get pin color:
    const getPinColor = (ChStation, BatterySwapStation) => {
        if (ChStation){
            return "#6DFF42";
            //green colour
        } 
        else if(BatterySwapStation){
            return '#00F0FF';
            //blue colour
        } 
        else{
            return '#FF6A6A';
            //red colour for destination
        }
    };

  return (
    <MapView
        ref={mapRef}
        style={tw `flex-1`}
        mapType='mutedStandard'
        initialRegion={{
            latitude: (maxlat + minlat) / 2,
            longitude: (maxlong + minlong) / 2,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005,
        }}
        showsUserLocation={true}
    >

{
  tspPairs.flatMap((item) =>
    item.map(({ current, next }) => {
      const { Latitude: currentLat, Longitude: currentLong, Color: currentColor } = current;
      const { Latitude: nextLat, Longitude: nextLong, Color: nextColor} = next;

    //   console.log('Current:', currentLat, currentLong);
    //   console.log('Next:', nextLat, nextLong);

      return (
        <React.Fragment key={Math.random()}>
          <MapViewDirections
            origin={{ latitude: currentLat, longitude: currentLong }}
            destination={{ latitude: nextLat, longitude: nextLong }}
            apikey={GOOGLE_MAPS_APIKEY}
            strokeColor={currentColor}
            strokeWidth={3}
          />
        </React.Fragment>
      );
    })
  )
}


{tsp.map((item) => (
    item["Nodes"].map(({Latitude,Longitude,ChStation,BatterySwapStation,text}) => (
        <Marker
            key={Math.random()} // Make sure to use a unique key for each Marker
            coordinate={{
                latitude: Latitude,
                longitude: Longitude,
            }}
            title='Destination'
            description={text}
            identifier='destination'
            pinColor={getPinColor(ChStation,BatterySwapStation)}
        />
    ))
))}


    </MapView>
  )
}
export default Map