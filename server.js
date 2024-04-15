const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = 3000;

// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Mocked distance calculation function using Google Distance Matrix API
async function calculateDistance(origin, destination) {
  // Mocked function to fetch distance from Google Distance Matrix API
  // Replace this with your actual API call
  
  const apiKey = process.env.GOOGLE_MAPS_APIKEY; // Replace with your Google API key
  const originLatLng = `${origin.latitude},${origin.longitude}`;
  const destinationLatLng = `${destination.latitude},${destination.longitude}`;

  const url = `https://maps.googleapis.com/maps/api/distancematrix/json?units=metric&origins=${originLatLng}&destinations=${destinationLatLng}&key=${apiKey}`;
  const response = await axios.get(url);
  
  const distance = response.data.rows[0].elements[0].distance.value; // Distance in meters
  const time = response.data.rows[0].elements[0].duration.text;

  console.log(time);

  return {distance,time};
}

function getRandomColor() {
    const minLightness = 50; 
    const maxLightness = 80; 
    
    const hue = Math.floor(Math.random() * 360);
    const saturation = Math.floor(Math.random() * (100 - 40 + 1)) + 40;
    const lightness = Math.floor(Math.random() * (maxLightness - minLightness + 1)) + minLightness;
  
    const rgbColor = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  
    return rgbColor;
  }
  
  // Example usage
  const randomColor = getRandomColor();

// Nearest Neighbor TSP algorithm
async function nearestNeighborTSP(inputs) {
    const n = inputs.length;
    const visited = Array(n).fill(false);
    visited[0] = true; // Start with the first city

    let a=Object.assign({},inputs[0]);
    a['distance']=0;
    a['time']=0;
    a['color']=getRandomColor();
    const path = [a]; // Start the path with the first city
  
    let currentCityIndex = 0;
    for (let i = 1; i < n; i++) {
      let minDistance = Infinity;
      let minTime = Infinity;
      let nextCityIndex = -1;
      for (let j = 0; j < n; j++) {
        if (!visited[j]){
          const {distance,time} = await calculateDistance(inputs[currentCityIndex], inputs[j]);
          if (!Number.isNaN(distance) && Number.isFinite(distance) && distance < minDistance) {
            minDistance = distance;
            nextCityIndex = j;
            minTime = time;
          }
        }
      }
      if (nextCityIndex !== -1) {
        let a=Object.assign({},inputs[nextCityIndex]);
        a['distance']=minDistance;
        a['time']=minTime;
        a['color']=getRandomColor();

        path.push(a);
        visited[nextCityIndex] = true;
        currentCityIndex = nextCityIndex;
      } else {
        console.error('Error calculating distance for next city');
        return null; // Return null if distance calculation fails
      }
    }
  
    // Return to the starting city
    a=Object.assign({},inputs[0]);
    a.id=Math.random();
    const {distance,time} = await calculateDistance(inputs[0], inputs[currentCityIndex]);
    a['distance']=distance;
    a['time']=time;
    a['color']=getRandomColor();
    path[0].color=a['color'];
    path.push(a);

    return path;
  }
  

// POST endpoint to receive data from frontend
app.post('/', async (req, res) => {
  try {
    const requestData = req.body;
    
    //for trying to give json object to aman bhaiya:
    console.log(requestData);

    const inputs = requestData.location;

    // Solve TSP using nearest neighbor algorithm
    const tspPath = await nearestNeighborTSP(inputs);

    console.log(tspPath);
    // Send the path back to the frontend
    res.json(tspPath);
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
