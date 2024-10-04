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
  const newTower = { id: towerId, latitude, longitude, height, assetId, heading, pitch, roll };
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

      // Update the delete popup with tower data
      document.getElementById('towerInfo').innerHTML = `
      <p style="color: white;"><strong>Latitude:</strong> ${selectedTowerData.latitude}</p>
      <p style="color: white;"><strong>Longitude:</strong> ${selectedTowerData.longitude}</p>
      <p style="color: white;"><strong>Height:</strong> ${selectedTowerData.height} m</p>
      <p style="color: white;"><strong>Heading:</strong> ${selectedTowerData.heading} m</p>
      <p style="color: white;"><strong>Pitch:</strong> ${selectedTowerData.pitch} m</p>
      <p style="color: white;"><strong>Roll:</strong> ${selectedTowerData.roll} m</p>
    `;    

      document.getElementById('infoTowerForm').style.display = 'block'; // Show the delete button
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

// Load towers on page load
window.onload = async function () {
  await createOsmBuildingsAsync(); // Make sure OSM buildings are fully loaded.

  const savedTowers = loadTowers();
  savedTowers.forEach(tower => {
    placeTower(tower, tower.id);
  });
};

// Delete selected tower and pin button event
document.getElementById('deleteSelectedTowerBtn').addEventListener('click', () => {
  if (selectedTowerId) {
    deleteTowerFromLocalStorage(selectedTowerId); // Delete the selected tower and pin
  }
});

function showDeletePopup() {
  document.getElementById("infoTowerForm").style.display = "block";
}

// Close the popup
function closeDeletePopup() {
  document.getElementById("infoTowerForm").style.display = "none";
}

// Close the popup when clicking outside of it
// window.onclick = function(event) {
//   var form = document.getElementById("infoTowerForm");
//   if (event.target != form && !form.contains(event.target)) {
//       closeDeletePopup();
//   }
// }

// Close popup when clicking on the close button
document.getElementById("closeBtn").onclick = function() {
  closeDeletePopup();
}

// viewer.screenSpaceEventHandler.setInputAction((movement) => {
//   const pickedObject = viewer.scene.pick(movement.endPosition);
  
//   // Check if the object is hovered and has an id
//   if (pickedObject && pickedObject.id) {
//     const pickedId = pickedObject.id.id;

//     // Show the description and trigger the delete popup on hover
//     if (pickedId.startsWith('tower-')) {
//       selectedTowerId = pickedId.split('-')[1]; // Extract the tower ID

//       // Retrieve the tower data from localStorage
//       const towers = loadTowers();
//       selectedTowerData = towers.find(tower => tower.id == selectedTowerId); // Store the tower data

//       // Update the delete popup with tower data
//       document.getElementById('towerInfo').innerHTML = `
//       <p style="color: white;"><strong>Latitude:</strong> ${selectedTowerData.latitude}</p>
//       <p style="color: white;"><strong>Longitude:</strong> ${selectedTowerData.longitude}</p>
//       <p style="color: white;"><strong>Height:</strong> ${selectedTowerData.height} m</p>
//       <p style="color: white;"><strong>Heading:</strong> ${selectedTowerData.heading} m</p>
//       <p style="color: white;"><strong>Pitch:</strong> ${selectedTowerData.pitch} m</p>
//       <p style="color: white;"><strong>Roll:</strong> ${selectedTowerData.roll} m</p>
//       `;

//       // Show the popup and position it based on the mouse movement
//       const infoTowerForm = document.getElementById('infoTowerForm');
//       infoTowerForm.style.display = 'block';
//       infoTowerForm.style.top = `${movement.endPosition.y + 20}px`;
//       infoTowerForm.style.left = `${movement.endPosition.x + 20}px`;
//     }
//   } else {
//     // If no object is hovered, hide the popup
//     document.getElementById('infoTowerForm').style.display = 'none';
//   }
// }, ScreenSpaceEventType.MOUSE_MOVE);
