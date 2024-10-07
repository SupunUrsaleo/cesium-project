import { Cartesian3, createOsmBuildingsAsync, IonResource, Ion, Math as CesiumMath, Terrain, Viewer, Color, HeadingPitchRoll, Transforms, PinBuilder, VerticalOrigin, ScreenSpaceEventType } from 'cesium';
import 'cesium/Build/Cesium/Widgets/widgets.css';
// import './style.css';

// Set the base URL for static assets
window.CESIUM_BASE_URL = '/Cesium';

// Set your Cesium ion access token
Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJhZTRmMDZhNS1jMTVmLTQxMTYtOGMwNi04NDAxMmJmOTZiYmEiLCJpZCI6MjQ0NTE5LCJpYXQiOjE3Mjc0MjgxMjJ9.JWqnRd89lZ2rwUKF44-bgZLvqRNDfHBPGEaNdKoEBB0';

// Initialize Cesium Viewer
const viewer = new Viewer('cesiumContainer', {
  terrain: Terrain.fromWorldTerrain(),
});

let selectedTowerId = null; // Track the selected tower ID
let selectedTowerData = {}; // Store tower data (latitude, longitude, height, etc.)

// Function to save towers in localStorage
function saveTowers(towers) {
  localStorage.setItem('towers', JSON.stringify(towers));
}

// Function to load towers from localStorage
function loadTowers() {
  const towersData = localStorage.getItem('towers');
  if (towersData) {
    return JSON.parse(towersData);
  }
  return [];
}

// Function to delete a tower and its pin from the viewer and localStorage
function deleteTowerFromLocalStorage(towerId) {
  let towers = loadTowers();
  towers = towers.filter(tower => tower.id !== parseInt(towerId));  // Remove the tower with the matching ID
  saveTowers(towers);
  // Remove both the pin and the tower from Cesium viewer
  viewer.entities.removeById(`tower-${towerId}`);
  viewer.entities.removeById(`pin-${towerId}`);
  document.getElementById('infoTowerForm').style.display = 'none'; // Hide the delete button
  selectedTowerId = null; // Clear the selected tower
}

// Function to place a tower model and pin on the map
async function placeTower(tower, towerId) {
  const position = Cartesian3.fromDegrees(tower.longitude, tower.latitude, tower.height);
  const towerUri = await IonResource.fromAssetId(tower.assetId);

  const orientation = Transforms.headingPitchRollQuaternion(
    position,
    new HeadingPitchRoll(
      CesiumMath.toRadians(tower.heading),
      CesiumMath.toRadians(tower.pitch),
      CesiumMath.toRadians(tower.roll)
    )
  );

  // Create a pin for the tower using PinBuilder
  const pinBuilder = new PinBuilder();
  const pin = pinBuilder.fromText("T", Color.BLUE, 48).toDataURL();  // Custom pin with "T" text

  // Add the tower entity (3D model)
  viewer.entities.add({
    id: `tower-${towerId.toString()}`, // Unique ID for the tower model
    position: position,
    model: { uri: towerUri },
    orientation: orientation,
    description: `
      <div style="font-family: Arial, sans-serif; padding: 10px; border-radius: 5px; background-color: #282828; color: #fff; border: 1px solid #ccc;">
        <h2 style="text-align: center; color: #fff;">Tower Information</h2>
        <p><strong>Longitude:</strong> ${tower.longitude}</p>
        <p><strong>Latitude:</strong> ${tower.latitude}</p>
        <p><strong>Height:</strong> ${tower.height} m</p>
      </div>`
  });

  // Add the pin for the tower
  viewer.entities.add({
    id: `pin-${towerId.toString()}`, // Unique ID for the pin
    position: position,
    billboard: {
      image: pin,
      verticalOrigin: VerticalOrigin.BOTTOM
    },
    description: `
      <div style="font-family: Arial, sans-serif; padding: 10px; border-radius: 5px; background-color: #282828; color: #fff; border: 1px solid #ccc;">
        <h2 style="text-align: center; color: #fff;">Tower Information</h2>
        <p><strong>Longitude:</strong> ${tower.longitude}</p>
        <p><strong>Latitude:</strong> ${tower.latitude}</p>
        <p><strong>Height:</strong> ${tower.height} m</p>
      </div>`
  });
}

// Function to add a new tower and store it in localStorage
function addTowerToLocalStorage(latitude, longitude, height, assetId, heading, pitch, roll) {
  const towerId = Date.now(); // Generate a unique ID for the tower (timestamp)
  const towers = loadTowers();
  
  // Initialize the new tower with an empty equipments array
  const newTower = { 
    id: towerId, 
    latitude, 
    longitude, 
    height, 
    assetId, 
    heading, 
    pitch, 
    roll,
    equipments: [] // Empty array for equipments
  };
  
  towers.push(newTower);
  saveTowers(towers); // Save the new tower to localStorage
  placeTower(newTower, towerId); // Place the tower and pin on the map
}

// Unified event handler for clicking on towers and pins
viewer.screenSpaceEventHandler.setInputAction((click) => {
  const pickedObject = viewer.scene.pick(click.position);
  if (pickedObject && pickedObject.id) {
    const pickedId = pickedObject.id.id;

    // Fly to the tower if the pin is clicked
    if (pickedId.startsWith('pin-')) {
      const towerId = pickedId.split('pin-')[1];
      viewer.flyTo(viewer.entities.getById(`tower-${towerId}`));
    }

    // Show the description and trigger the delete button
    if (pickedId.startsWith('tower-')) {
      selectedTowerId = pickedId.split('-')[1]; // Extract the tower ID

      // Retrieve the tower data from localStorage
      const towers = loadTowers();
      selectedTowerData = towers.find(tower => tower.id == selectedTowerId); // Store the tower data

      // Update the delete popup with tower data and show input for equipment
      document.getElementById('towerInfo').innerHTML = `
      <p style="color: white;"><strong>Latitude:</strong> ${selectedTowerData.latitude}</p>
      <p style="color: white;"><strong>Longitude:</strong> ${selectedTowerData.longitude}</p>
      <p style="color: white;"><strong>Height:</strong> ${selectedTowerData.height} m</p>
      <p style="color: white;"><strong>Heading:</strong> ${selectedTowerData.heading} m</p>
      <p style="color: white;"><strong>Pitch:</strong> ${selectedTowerData.pitch} m</p>
      <p style="color: white;"><strong>Roll:</strong> ${selectedTowerData.roll} m</p>
      `;    

      document.getElementById('infoTowerForm').style.display = 'block'; // Show the delete button and equipment form
    }
  }
}, ScreenSpaceEventType.LEFT_CLICK);

// Event listener for placing a tower
document.getElementById('placeTowerBtn').addEventListener('click', () => {
  const latitude = parseFloat(document.getElementById('latitude').value);
  const longitude = parseFloat(document.getElementById('longitude').value);
  const height = parseFloat(document.getElementById('height').value);
  const assetId = parseInt(document.getElementById('assetId').value); // Asset ID as an integer
  const heading = parseFloat(document.getElementById('heading').value); // Heading input
  const pitch = parseFloat(document.getElementById('pitch').value);    // Pitch input
  const roll = parseFloat(document.getElementById('roll').value);      // Roll input

  addTowerToLocalStorage(latitude, longitude, height, assetId, heading, pitch, roll);
});

// Event listener for adding equipment
document.getElementById('addAntennaBtn').addEventListener('click', () => {
  const assetId = parseInt(document.getElementById('equipmentAssetId').value);
  const equipmentHeight = parseFloat(document.getElementById('antennaHeight').value);
  const azimuth = parseFloat(document.getElementById('azimuth').value);  // Direction
  const tilt = parseFloat(document.getElementById('tilt').value);        // Tilt angle
  const offset = parseFloat(document.getElementById('offset').value);    // Offset distance

  // Retrieve the tower from localStorage
  let towers = loadTowers();
  let tower = towers.find(t => t.id == selectedTowerId);

  // Add the new equipment details to the tower's equipments array
  const newEquipment = { 
    assetId, 
    equipmentHeight, 
    azimuth, 
    tilt, 
    offset 
  };
  tower.equipments.push(newEquipment); // Add the equipment to the tower

  // Save the updated towers array back to localStorage
  saveTowers(towers);

  // Place the equipment on the tower in the viewer
  const { latitude, longitude } = tower;
  const equipmentPosition = calculateOffsetPosition(latitude, longitude, offset, azimuth);
  placeEquipment(assetId, equipmentPosition, equipmentHeight, tilt);

  // // Clear the form after adding the equipment
  // document.getElementById('equipmentAssetId').value = '';
  // document.getElementById('antennaHeight').value = '';
  // document.getElementById('azimuth').value = '';
  // document.getElementById('tilt').value = '';
  // document.getElementById('offset').value = '1.5'; // Reset the offset to default
});

// Load towers on page load
window.onload = async function () {
  await createOsmBuildingsAsync(); // Make sure OSM buildings are fully loaded.

  const savedTowers = loadTowers();
  savedTowers.forEach(tower => {
    placeTower(tower, tower.id);

    // If the tower has equipments, place them as well
    if (tower.equipments && tower.equipments.length > 0) {
      tower.equipments.forEach(equipment => {
        const { latitude, longitude } = tower;
        const equipmentPosition = calculateOffsetPosition(latitude, longitude, equipment.offset, equipment.azimuth);
        placeEquipment(equipment.assetId, equipmentPosition, equipment.equipmentHeight, equipment.tilt);
      });
    }
  });
};

// Delete selected tower and pin button event
document.getElementById('deleteSelectedTowerBtn').addEventListener('click', () => {
  if (selectedTowerId) {
    deleteTowerFromLocalStorage(selectedTowerId); // Delete the selected tower and pin
  }
});

// Close popup when clicking on the close button
document.getElementById("closeBtn").onclick = function() {
  document.getElementById("infoTowerForm").style.display = "none";
};

// Function to calculate offset position for equipment
function calculateOffsetPosition(latitude, longitude, offset, azimuth) {
  const R = 6371000; // Radius of the Earth in meters
  const latOffset = offset / R * (180 / Math.PI);
  const lonOffset = offset / (R * Math.cos(Math.PI * latitude / 180)) * (180 / Math.PI);

  const newLatitude = latitude + latOffset * Math.cos(CesiumMath.toRadians(azimuth));
  const newLongitude = longitude + lonOffset * Math.sin(CesiumMath.toRadians(azimuth));

  return { latitude: newLatitude, longitude: newLongitude };
}

// Function to place equipment on the tower
async function placeEquipment(assetId, position, height, tilt) {
  const equipmentUri = await IonResource.fromAssetId(assetId);

  const orientation = Transforms.headingPitchRollQuaternion(
    Cartesian3.fromDegrees(position.longitude, position.latitude, height),
    new HeadingPitchRoll(CesiumMath.toRadians(0), CesiumMath.toRadians(tilt), 0)
  );

  viewer.entities.add({
    position: Cartesian3.fromDegrees(position.longitude, position.latitude, height),
    model: { uri: equipmentUri },
    orientation: orientation,
  });
}
