import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Icon } from 'react-native-elements'

const Dropdown = ({item}) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  return (
    <View style={{ flexDirection: 'column'}}>
        <TouchableOpacity onPress={toggleDropdown} style={{paddingBottom: 8, flexDirection:'row'}}>
            <Icon type="ionicon" name={isOpen ? 'caret-up-outline' : 'caret-down-outline'} size={24} color={item[0]["current"]["Color"]} />
            <Text style={{fontSize: 20, fontWeight: 'medium'}}>Vehicle {item[0]["current"]["VehicleNumber"]}:</Text>
        </TouchableOpacity>
        {isOpen && (
            <View style={{padding: 10}}>
                <Text style={{fontSize: 16, padding: 1}}>Time: {item[0]["current"]["TotTime"]}</Text>
                <Text style={{fontSize: 16, padding: 1}}>Cost: {item[0]["current"]["TotCost"]}</Text>
                <Text style={{fontSize: 16, padding: 1}}>Route: </Text>
                {item.map(({ current, next }) => {
                    return(
                        <View key={Math.random()} style={{borderBottomWidth: 1,borderBottomColor: '#ccc', marginLeft:10, padding: 10}}>
                            <Text style={{marginBottom: 5}}>Current: {current.text} </Text>
                            <Text>Next: {next.text}</Text>
                        </View>
                    )
                })}
            </View>
        )}
    </View>
  );
};

export default Dropdown;