import React from 'react';
import { StyleSheet, Text, View, FlatList, ScrollView } from 'react-native';
import tw from 'twrnc';
import { useSelector } from 'react-redux';
import { selectVisitOrder } from '../slices/navSlice.js';
import CityDrawer from './CityDrawer.js'
import Dropdown from './DropDown.js'

const Directions = () => {
    let tsp = useSelector(selectVisitOrder);
//   console.log(tsp);

    let tspPairs = [];
    for (let i = 0; i < tsp.length; i++){
        tspPairs.push([]);

        for (let j = 0; j < tsp[i]["Nodes"].length - 1; j++){
            let current=Object.assign({},tsp[i]["Nodes"][j]);
            let next=Object.assign({},tsp[i]["Nodes"][j+1]);

            // console.log('Current:', current);
            // console.log('Next:', next);
            current['Color']=tsp[i]["color"];
            next['Color']=tsp[i]["color"];
            current["VehicleNumber"]=tsp[i]["VehicleNumber"];
            next["VehicleNumber"]=tsp[i]["VehicleNumber"];
            current["TotCost"]=tsp[i]["TotCost"];
            next["TotCost"]=tsp[i]["TotCost"];
            current["TotTime"]=tsp[i]["TotTime"];
            next["TotTime"]=tsp[i]["TotTime"];

            tspPairs[i].push({ current, next });
        }
    }
    console.log(tspPairs);

  // Function to render each item in the FlatList
//   const renderItem = ({ item }) => {
//     return (
//       <View style={styles.item}>
//         {tspPairs.map((item) => {
//             <Text>VehicleNumber: {item[0]["current"]["VehicleNumber"]} - TotTime: {item[0]["current"]["TotTime"]} - TotCost: {item[0]["current"]["TotTime"]}</Text>
//             item.map(({current,next}) => {
//                 <View>
//                     <Text>Current: {current["text"]} - Next: {next["text"]}</Text>
//                 </View>
//             })
//         })}
//         {/* <CityDrawer currentCity={item.current.text} nextCity={item.next.text} distance={item.next.distance} time={item.next.time} currentColor={item.current.color} nextColor={item.next.color}/> */}
//       </View>
//     );
//   };

  return (
    <ScrollView>
      <View style={styles.container}>
        <Text style={tw`text-center py-5 text-xl`}>Directions</Text>
        <View style={tw `border-t border-gray-300 flex-shrink`}>
            
            {tspPairs.flatMap((item) => {
                return(
                        <View style={styles.item}>
                            <Dropdown item={item}/>
                        </View>
                );
            })}

                {/* <CityDrawer currentCity={item.current.text} nextCity={item.next.text} distance={item.next.distance} time={item.next.time} currentColor={item.current.color} nextColor={item.next.color}/> */}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 5,
  },
  item: {
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
});

export default Directions;
