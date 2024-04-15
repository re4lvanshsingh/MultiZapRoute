import { StyleSheet, Text, View, SafeAreaView, KeyboardAvoidingView,TextInput,ScrollView } from 'react-native'
import React,{useRef,useState,useEffect,createRef} from 'react'
import tw from 'twrnc';
import NavOptions from '../components/NavOptions.js';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { GOOGLE_MAPS_APIKEY } from '@env'
import { useDispatch } from 'react-redux';
import { setVisitOrder } from '../slices/navSlice.js';
import NavFavourites from '../components/NavFavourites.js';
import { FlatList } from 'react-native';
import { TouchableOpacity } from 'react-native';
import { Button, Icon } from 'react-native-elements';
import NetInfo from "@react-native-community/netinfo";
import OfflineNotification from '../components/Offline.js';
import { Permissions } from 'expo';
import * as Location from 'expo-location';
import create from '@ant-design/icons/lib/components/IconFont.js';
import { Dimensions } from 'react-native';
import { ScreenHeight, ScreenWidth } from 'react-native-elements/dist/helpers/index.js';
import { ListView } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

//Function to request access to current location of user (GPS):
const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        // console.log('Location permission granted');
      } else {
        console.log('Location permission denied');
      }
    } catch (error) {
      console.error('Error requesting location permission:', error);
    }
};

const HomeScreen = () => {

    //To check if we are connected to Internet or not:
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

    //==================================================================================================

    //For accessing location:

    const getLocation = async (id,val) => {
        await requestLocationPermission();
        try {
            const { coords } = await Location.getCurrentPositionAsync({});
            const { latitude, longitude } = coords;
            
            //for debugging
            //console.log('Current location:', latitude, longitude);

            const texts="Current Location";

            if(val==1){
                googleRef.current.setAddressText("Current Location");
                handleInputChange(id,latitude,longitude,texts);
            }
            else if(val==2){
                swapRef.current.setAddressText("Current Location");
                handleBatterySwappingInputChange(id,latitude,longitude,texts);
            }
            else{
                chargeRef.current.setAddressText("Current Location");
                handleBatteryChargingInputChange(id,latitude,longitude,texts);
            }

        } catch(error){
            console.error('Error getting current location:', error);
        }
      };


    //==============================================================================================================
    //for Handling backend:
    
    //contains the information of responseData
    const [responseData, setResponseData] = useState([]);

    //contains the information of all textInputs related to Locations:
    const [textInputs, setTextInputs] = useState([{ id: 1,latitude: '', longitude: '', text: '', demandWeight: 0}]);

    //contains the information of all textInputs related to Vehicles:
    const [vehicle, setVehicle] = useState([]);

    //contains the information of all textInputs related to BatteryChargingStations:
    const [batteryChargingStation, setBatteryChargingStation] = useState([]);

    //contains the information of all textInputs related to BatterySwappingStation:
    const [batterySwappingStation, setBatterySwappingStation] = useState([]);


    const dispatch = useDispatch();

    function getRandomColor() {
        const minLightness = 50; 
        const maxLightness = 80; 
        
        const hue = Math.floor(Math.random() * 360);
        const saturation = Math.floor(Math.random() * (100 - 40 + 1)) + 40;
        const lightness = Math.floor(Math.random() * (maxLightness - minLightness + 1)) + minLightness;
      
        const rgbColor = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
      
        return rgbColor;
    }

    const sendDataToBackend = async () => {
        try {
            // Combine all input data into a single object
            const requestData = {
                location: textInputs.map(({ id, latitude, longitude, text, demandWeight }) => ({ id, latitude, longitude, text, demandWeight })),
                batterychargingstation: batteryChargingStation.map(({ id, latitude, longitude, text}) => ({ id, latitude, longitude, text})),
                batteryswappingstation: batterySwappingStation.map(({ id, latitude, longitude, text}) => ({ id, latitude, longitude, text})),
                vehicle: vehicle.map(({id,mxBatteryLevels,mxCostAllowed,mxWeightAllowed,speedOfVehicles,weightFactorForSpeed,weightFactorForDistance}) => ({id,mxBatteryLevels,mxCostAllowed,mxWeightAllowed,speedOfVehicles,weightFactorForSpeed,weightFactorForDistance})),
                fastChargingTimePerUnitOfCharge: 0.005,
                mediumChargingTimePerUnitOfCharge: 0.008,
                slowChargingTimePerUnitOfCharge: 0.013,
                batterySwappingCost: 30,
                batterySwappingTime: 0.2,
                mxVehicles: vehicle.length,
                mxCustomers: textInputs.length,
                dischargingConst: 10,
                temperature: 300,
                scalingFactor: 0.03,
                parameter: 0.5,
                fastTimeChargers: 2,
                mediumTimeChargers: 2,
                slowTimeChargers: 4,
                costPerUnitChargeOfFast: 3, // in rs/wh
                ostPerUnitChargeOfMedium: 1.4,
                costPerUnitChargeOfSlow: 0.9,
                mxBatteryChargingStations: batteryChargingStation.length,
                mxBatterySwappingStations: batterySwappingStation.length
            };
            // console.log(requestData);
            
            // Send the combined data to the backend
            const response = await fetch('http://10.35.15.0:3000',{
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData),
            });
    
            // Handle response if needed
            let responseData = await response.json();

            //Dispatch to redux store for future use in Map.js
            responseData={
                "Data": [
                    {
                        "VehicleNumber": 1,
                        "TotCost": 0.0,
                        "TotTime": 0.0195771,
                        "Nodes": [
                            {
                                "Latitude": 25.5408,
                                "Longitude": 84.8507,
                                "text": "Current Location",
                                "ChStation": false,
                                "BatterySwapStation": false
                            },
                            {
                                "Latitude": 25.5388,
                                "Longitude": 84.859,
                                "text": "Panache Inn, near IIT Main gate, Bihta, Bihar, India",
                                "ChStation": false,
                                "BatterySwapStation": false
                            },
                            {
                                "Latitude": 25.5408,
                                "Longitude": 84.8507,
                                "text": "Current Location",
                                "ChStation": false,
                                "BatterySwapStation": false
                            }
                        ]
                    },
                    {
                        "VehicleNumber": 2,
                        "TotCost": 2857.7,
                        "TotTime": 12.1023,
                        "Nodes": [
                            {
                                "Latitude": 25.5408,
                                "Longitude": 84.8507,
                                "text": "Current Location",
                                "ChStation": false,
                                "BatterySwapStation": false
                            },
                            {
                                "Latitude": 25.5547,
                                "Longitude": 84.8575,
                                "text": "IIT Patna Gate No. 2, IIT Main Road, Dayalpur Daulatpur, Bihar, India",
                                "ChStation": false,
                                "BatterySwapStation": false
                            },
                            {
                                "Latitude": 25.6186,
                                "Longitude": 85.08,
                                "text": "Panache Patna",
                                "ChStation": true,
                                "BatterySwapStation": false
                            },
                            {
                                "Latitude": 25.6145,
                                "Longitude": 85.1437,
                                "text": "Lemon Tree Premier, Patna, Exhibition Road, near Gandhi Maidan Road, South Gandhi Maidan, Raja Ji Salai, Indira Nagar, Patna, Bihar, India",
                                "ChStation": false,
                                "BatterySwapStation": false
                            },
                            {
                                "Latitude": 25.5408,
                                "Longitude": 84.8507,
                                "text": "Current Location",
                                "ChStation": false,
                                "BatterySwapStation": false
                            }
                        ]
                    }
                ]
            };

            let finalData=[];
            responseData["Data"].map((item)=>{
                let a=Object.assign({},item);
                a["color"]=getRandomColor();

                finalData.push(a);
            });

            setResponseData(finalData);
            dispatch(setVisitOrder(finalData));

            console.log(finalData);
            //To check the TSP path obtained:
            // console.log(responseData);
        } catch (error) {
            console.error('Error sending data to backend:', error);
        }
    };
    
    
      
    //===========================================================================================================
      //FOR DEALING WITH LOCATIONS:

  // Function to add a new textbox
  const addTextInput = () => {
    const newId = Math.random();
    setTextInputs([...textInputs, { id: newId,latitude: '', longitude: '', text: '', demandWeight: 0}]);
  };

  // Function to remove a specific textbox
  const removeTextInput = (idToRemove) => {
    const updatedInputs = textInputs.filter((input) => input.id !== idToRemove);
    setTextInputs(updatedInputs);
  };

  // Function to handle text input change
  const handleInputChange = (id, latitudes,longitudes, texts, demandWeights) => {
    const updatedInputs = textInputs.map((input) =>
      input.id === id ? { ...input, id: input.id, latitude: latitudes, longitude: longitudes, text: texts, demandWeight: demandWeights } : input
    );
    
    setTextInputs(updatedInputs);
    };

    //===========================================================================================================
      //FOR DEALING WITH BATTERY_CHARGING_STATION:

  // Function to add a new textbox
  const addBatteryChargingTextInput = () => {
    const newId = Math.random();
    setBatteryChargingStation([...batteryChargingStation, { id: newId, latitude: '', longitude: '', text: ''}]);
  };

  // Function to remove a specific textbox
  const removeBatteryChargingTextInput = (idToRemove) => {
    const updatedInputs = batteryChargingStation.filter((input) => input.id !== idToRemove);
    setBatteryChargingStation(updatedInputs);
  };

  // Function to handle text input change
  const handleBatteryChargingInputChange = (id, latitudes, longitudes, texts) => {
    const updatedInputs = batteryChargingStation.map((input) =>
      input.id === id ? { ...input, id: input.id, latitude: latitudes, longitude: longitudes, text: texts} : input
    );

    setBatteryChargingStation(updatedInputs);
  };

  //===========================================================================================================
      //FOR DEALING WITH BATTERY_SWAPPING_STATION:

  // Function to add a new textbox
  const addBatterySwappingTextInput = () => {
    const newId = Math.random();
    setBatterySwappingStation([...batterySwappingStation, { id: newId, latitude: '', longitude: '', text: ''}]);
  };

  // Function to remove a specific textbox
  const removeBatterySwappingTextInput = (idToRemove) => {
    const updatedInputs = batterySwappingStation.filter((input) => input.id !== idToRemove);
    setBatterySwappingStation(updatedInputs);
  };

  // Function to handle text input change
  const handleBatterySwappingInputChange = (id, latitudes, longitudes, texts) => {
    const updatedInputs = batterySwappingStation.map((input) =>
      input.id === id ? { ...input, id: input.id, latitude: latitudes, longitude: longitudes, text: texts} : input
    );

    setBatterySwappingStation(updatedInputs);
  };

//=========================================================================================================================================
//FOR DEALING WITH VEHICLES:

// Function to add a new textbox
const addVehicleTextInput = () => {
    const newId = Math.random();
    setVehicle([...vehicle, { id: newId,mxBatteryLevels: '', mxCostAllowed: '', mxWeightAllowed: '',speedOfVehicles: '',weightFactorForSpeed: '', weightFactorForDistance: ''}]);
};

// Function to remove a specific textbox
const removeVehicleTextInput = (idToRemove) => {
    const updatedInputs = vehicle.filter((input) => input.id !== idToRemove);
    setVehicle(updatedInputs);
};

// Function to handle text input change
const handleVehicleInputChange = ( id, mxBatteryLevelss, mxCostAlloweds, mxWeightAlloweds,speedOfVehicless,weightFactorForSpeeds, weightFactorForDistances) => {
    const updatedInputs = vehicle.map((input) =>
        input.id === id ? { ...input, id: input.id, mxBatteryLevels: mxBatteryLevelss, mxCostAllowed: mxCostAlloweds, mxWeightAllowed: mxWeightAlloweds,speedOfVehicles: speedOfVehicless,weightFactorForSpeed: weightFactorForSpeeds, weightFactorForDistance: weightFactorForDistances} : input
    );
    
    setVehicle(updatedInputs);
};


//===========================================================================================================================================

const googleRef=useRef(null);

const renderItem = ({ item }) => (
    <>
      <View key={item.id} style={styles.textInputRow}>
        <GooglePlacesAutocomplete
          ref={(item.id === textInputs[0].id) ? googleRef : null}
          placeholder={(item.id === textInputs[0].id) ? 'Start' : 'Where To?'}
          styles={{
            container: {
              flex: 1,
            },
            textInput: {
              fontSize: 18,
              height: 40,
              borderWidth: 1,
              borderColor: 'gray',
              marginLeft: 20,
              marginTop: 8,
            },
            listView: { zIndex: 9999 }, // Ensure that the pop-up appears above other elements
          }}
          onPress={(data, details) => {
            handleInputChange(item.id, details.geometry.location.lat, details.geometry.location.lng, data.description, item.demandWeight);
          }}
          fetchDetails={true}
          returnKeyType={"search"}
          enablePoweredByContainer={false}
          minLength={2}
          query={{
            key: GOOGLE_MAPS_APIKEY,
            language: "en"
          }}
          nearbyPlacesAPI='GooglePlacesSearch'
          debounce={400}
        />
  
        <View>
          <TouchableOpacity onPress={() => removeTextInput(item.id)}
            style={{
              marginLeft: 0,
            }}
          >
            <Icon
              style={tw `rounded-full `}
              name="remove-circle"
              type="ionicon"
              colors="white"
              size={30}
            />
          </TouchableOpacity>
        </View>
  
        <TouchableOpacity style={[tw `flex-row items-center p-5`]}
          onPress={() => getLocation(item.id,1)}>
          {item.id === textInputs[0].id &&
            <Icon
              style={tw `rounded-full bg-gray-300 p-1`}
              name="location"
              disabled={item.id !== textInputs[0].id}
              type="ionicon"
              colors="white"
              size={18}
            />
          }
        </TouchableOpacity>
        
      </View>
        {item.id!=textInputs[0].id &&
        <TextInput
            placeholder="Demand Weight"
            onChangeText={(text) => handleInputChange(item.id, item.latitude, item.longitude, item.text, text)}
            keyboardType="numeric"  // Restrict input to numeric values
            value={item.demandWeight} // Convert demandWeight to string if it's not already
            style={{paddingLeft: 25}}
        />
        }
    </>
  );

//=========================================================================================================================================
const chargeRef=useRef(null);

const renderItemBatteryCharge = ({ item }) => (
    <>
      <View key={item.id} style={styles.textInputRow}>
        <GooglePlacesAutocomplete
          ref={(item.id === batteryChargingStation[0].id) ? chargeRef : null}
          placeholder={'Battery Charging Station'}
          styles={{
            container: {
              flex: 1,
            },
            textInput: {
              fontSize: 18,
              height: 40,
              borderWidth: 1,
              borderColor: 'gray',
              marginLeft: 20,
              marginTop: 8,
            },
          }}
          onPress={(data, details) => {
            handleBatteryChargingInputChange(item.id, details.geometry.location.lat, details.geometry.location.lng, data.description);
          }}
          fetchDetails={true}
          returnKeyType={"search"}
          enablePoweredByContainer={false}
          minLength={2}
          query={{
            key: GOOGLE_MAPS_APIKEY,
            language: "en"
          }}
          nearbyPlacesAPI='GooglePlacesSearch'
          debounce={400}
        />
  
        <View>
          <TouchableOpacity onPress={() => removeBatteryChargingTextInput(item.id)}
            style={{
              marginLeft: 0,
            }}
          >
            <Icon
              style={tw `rounded-full `}
              name="remove-circle"
              type="ionicon"
              colors="white"
              size={30}
            />
          </TouchableOpacity>
        </View>
  
        <TouchableOpacity style={[tw `flex-row items-center p-5`]}
          onPress={() => getLocation(item.id,3)}>
          {item.id === batteryChargingStation[0].id &&
            <Icon
              style={tw `rounded-full bg-gray-300 p-1`}
              name="location"
              disabled={item.id !== batteryChargingStation[0].id}
              type="ionicon"
              colors="white"
              size={18}
            />
          }
        </TouchableOpacity>
        
      </View>
    </>
  );

//=========================================================================================================================================
const swapRef=useRef(null);

const renderItemBatterySwap = ({ item }) => (
    <>
      <View key={item.id} style={styles.textInputRow}>
        <GooglePlacesAutocomplete
          ref={(item.id === batterySwappingStation[0].id) ? swapRef : null}
          placeholder={'Battery Swapping Station'}
          styles={{
            container: {
              flex: 1,
            },
            textInput: {
              fontSize: 18,
              height: 40,
              borderWidth: 1,
              borderColor: 'gray',
              marginLeft: 20,
              marginTop: 8,
            },
          }}
          onPress={(data, details) => {
            handleBatterySwappingInputChange(item.id, details.geometry.location.lat, details.geometry.location.lng, data.description);
          }}
          fetchDetails={true}
          returnKeyType={"search"}
          enablePoweredByContainer={false}
          minLength={2}
          query={{
            key: GOOGLE_MAPS_APIKEY,
            language: "en"
          }}
          nearbyPlacesAPI='GooglePlacesSearch'
          debounce={400}
        />
  
        <View>
          <TouchableOpacity onPress={() => removeBatterySwappingTextInput(item.id)}
            style={{
              marginLeft: 0,
            }}
          >
            <Icon
              style={tw `rounded-full `}
              name="remove-circle"
              type="ionicon"
              colors="white"
              size={30}
            />
          </TouchableOpacity>
        </View>
  
        <TouchableOpacity style={[tw `flex-row items-center p-5`]}
          onPress={() => getLocation(item.id,2)}>
          {item.id === batterySwappingStation[0].id &&
            <Icon
              style={tw `rounded-full bg-gray-300 p-1`}
              name="location"
              disabled={item.id !== batterySwappingStation[0].id}
              type="ionicon"
              colors="white"
              size={18}
            />
          }
        </TouchableOpacity>
        
      </View>
    </>
  );

//=========================================================================================================================================
  const renderItemVehicle = ({ item }) => (
    <>
        {/* id, mxBatteryLevelss, mxCostAlloweds, mxWeightAlloweds,speedOfVehicless,weightFactorForSpeeds, weightFactorForDistances */}
        <TextInput
            placeholder="mxBatteryLevel"
            onChangeText={(text) => handleVehicleInputChange(item.id, text, item.mxCostAllowed, item.mxWeightAllowed, item.speedOfVehicles,item.weightFactorForSpeed,item.weightFactorForDistance)}
            keyboardType="numeric"  // Restrict input to numeric values
            value={item.mxBatteryLevels} // Convert demandWeight to string if it's not already
            style={{paddingLeft: 25}}
        />
        <TextInput
            placeholder="mxCostAllowed"
            onChangeText={(text) => handleVehicleInputChange(item.id, item.mxBatteryLevels, text, item.mxWeightAllowed, item.speedOfVehicles,item.weightFactorForSpeed,item.weightFactorForDistance)}
            keyboardType="numeric"  // Restrict input to numeric values
            value={item.mxCostAllowed} // Convert demandWeight to string if it's not already
            style={{paddingLeft: 25}}
        />
        <TextInput
            placeholder="mxWeightAllowed"
            onChangeText={(text) => handleVehicleInputChange(item.id, item.mxBatteryLevels, item.mxCostAllowed, text, item.speedOfVehicles,item.weightFactorForSpeed,item.weightFactorForDistance)}
            keyboardType="numeric"  // Restrict input to numeric values
            value={item.mxWeightAllowed} // Convert demandWeight to string if it's not already
            style={{paddingLeft: 25}}
        />
        <TextInput
            placeholder="speedOfVehicle"
            onChangeText={(text) => handleVehicleInputChange(item.id, item.mxBatteryLevels, item.mxCostAllowed, item.mxWeightAllowed, text,item.weightFactorForSpeed,item.weightFactorForDistance)}
            keyboardType="numeric"  // Restrict input to numeric values
            value={item.speedOfVehicles} // Convert demandWeight to string if it's not already
            style={{paddingLeft: 25}}
        />
        <TextInput
            placeholder="weightFactorForSpeed"
            onChangeText={(text) => handleVehicleInputChange(item.id, item.mxBatteryLevels, item.mxCostAllowed, item.mxWeightAllowed, item.speedOfVehicles,text,item.weightFactorForDistance)}
            keyboardType="numeric"  // Restrict input to numeric values
            value={item.weightFactorForSpeed} // Convert demandWeight to string if it's not already
            style={{paddingLeft: 25}}
        />
        <TextInput
            placeholder="weightFactorForSpeed"
            onChangeText={(text) => handleVehicleInputChange(item.id, item.mxBatteryLevels, item.mxCostAllowed, item.mxWeightAllowed, item.speedOfVehicles,item.weightFactorForSpeed,text)}
            keyboardType="numeric"  // Restrict input to numeric values
            value={item.weightFactorForDistance} // Convert demandWeight to string if it's not already
            style={{paddingLeft: 25}}
        />
        <TouchableOpacity onPress={() => removeVehicleTextInput(item.id)}
            style={{
              marginLeft: 0,
            }}
          >
            <Icon
              style={tw `rounded-full `}
              name="remove-circle"
              type="ionicon"
              colors="white"
              size={30}
            />
          </TouchableOpacity>
    </>
  );
  

    return (
        
    <SafeAreaView style={tw `bg-white flex-1`}>
        <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
                <ScrollView>
        <View style={tw `p-5`}>
            {/* The name of our app - ZapRoute (an efficient way to route between cities) */}
            <Text style={{color:"black", paddingTop:30, paddingBottom:5 ,fontWeight:"bold",fontSize:35 }}>ZapRoutes</Text>
        </View>

        <View style={{flex:1}}>
            {/*============================================================================================================ */}
            {/*FOR LOCATIONS*/}

            <View style={{height: 150}}>
            <Text style={{color:"black", paddingLeft:5 ,fontWeight:"bold",fontSize:20 }}>Locations</Text>
            <FlatList
                data={textInputs}
                renderItem={renderItem}
                keyExtractor={item => item.id.toString()}
            />
    
            <TouchableOpacity onPress={() => {
                addTextInput();
            }}>
                <Icon
                    style={tw `rounded-full`}
                    name="add-circle"
                    type="ionicon"
                    colors="white"
                    size={30}
                />
            </TouchableOpacity>
            </View>

            {/*============================================================================================================ */}
            {/*BATTERY_CHARGING_STATION*/}
            <View style={{height: 150}}>
            <Text style={{color:"black", paddingLeft:5 ,fontWeight:"bold",fontSize:20 }}>BatteryChargingStation</Text>

            <FlatList
                data={batteryChargingStation}
                renderItem={renderItemBatteryCharge}
                keyExtractor={item => item.id.toString()}
            />

            <TouchableOpacity onPress={() => {
                addBatteryChargingTextInput();
            }}>
                <Icon
                    style={tw `rounded-full`}
                    name="add-circle"
                    type="ionicon"
                    colors="white"
                    size={30}
                />
            </TouchableOpacity>
            </View>

            {/*============================================================================================================ */}
            {/*BATTERY_SWAPPING_STATION*/}
            <View style={{height: 150}}>
            <Text style={{color:"black", paddingLeft:5 ,fontWeight:"bold",fontSize:20 }}>BatterySwappingStation</Text>

            <FlatList
                data={batterySwappingStation}
                renderItem={renderItemBatterySwap}
                keyExtractor={item => item.id.toString()}
            />

            <TouchableOpacity onPress={() => {
                addBatterySwappingTextInput();
            }}>
                <Icon
                    style={tw `rounded-full`}
                    name="add-circle"
                    type="ionicon"
                    colors="white"
                    size={30}
                />
            </TouchableOpacity>
            </View>


            {/*============================================================================================================ */}
            {/*FOR VEHICLES*/}

            <View style={{height: 150}}>
            <Text style={{color:"black", paddingLeft:5 ,fontWeight:"bold",fontSize:20 }}>Vehicles</Text>

            <FlatList
                data={vehicle}
                renderItem={renderItemVehicle}
                keyExtractor={item => item.id.toString()}
                
            />

            <TouchableOpacity onPress={() => {
                addVehicleTextInput();
            }}>
                <Icon
                    style={tw `rounded-full`}
                    name="add-circle"
                    type="ionicon"
                    colors="white"
                    size={30}
                />
            </TouchableOpacity>
            </View>
        </View>


        {/***********************************************************************************************************/}
      {/*Dealing with backend*/}
      {/* <Button title="Send Data" onPress={sendDataToBackend} />
      
      <Text style={styles.responseText}>Response from Backend:</Text>
      {responseData.map(({ id, latitude, longitude, text }) => (
    <View key={Math.random()}>
        <Text style={styles.responseText}>
            Textbox {id}:
            Latitude: {latitude ? latitude : 'N/A'}, 
            Longitude: {longitude ? longitude : 'N/A'},
            Text: {text}
        </Text>
    </View>
))} */}



        {/********************************************************************************************/}
        {/* For checking the connection - if we are connected or not */}
        {!isConnected && 
        <View style={{position: 'absolute', bottom: 0, left: 0, right: 0}}>
            <OfflineNotification/>
        </View>}
        </ScrollView>
        <View style={{position:'absolute', marginTop:ScreenHeight*0.93, paddingLeft:ScreenWidth*0.395, alignContent:'center'}}>
            <NavOptions sendDataToBackend={sendDataToBackend} textInputs={textInputs}/>
        </View>
            </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    textInputsContainer: {
        flex: 1,
      marginBottom: 0,
    },
    textInputRow: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 3
    },
    textInput: {
      flex: 1,
      height: 40,
      borderColor: 'gray',
      borderWidth: 1,
      marginRight: 10,
    },
    removeText: {
      color: 'red',
    },
    addText: {
      color: 'blue',
      marginTop: 5,
    },
    responseText: {
      marginTop: 20,
      fontSize: 16,
    },
  });

export default HomeScreen