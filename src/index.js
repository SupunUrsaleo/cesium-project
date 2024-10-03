import { Cartesian3, createOsmBuildingsAsync, IonResource, Ion, Math as CesiumMath, Terrain, Viewer, Color, HeadingPitchRoll, Transforms } from 'cesium';
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

// Function to delete a tower from localStorage
function deleteTowerFromLocalStorage(towerId) {
  let towers = loadTowers();
  towers = towers.filter(tower => tower.id !== parseInt(towerId));  // Remove the tower with the matching ID
  saveTowers(towers);
  viewer.entities.removeById(towerId); // Remove the entity from the viewer
  document.getElementById('deleteTowerForm').style.display = 'none'; // Hide the delete button
  selectedTowerId = null; // Clear the selected tower
}

// Function to place a tower model on the map
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

  // Add the tower entity with the custom orientation
  viewer.entities.add({
    id: towerId.toString(),
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

  viewer.flyTo(viewer.entities.getById(towerId.toString()));
}

// Function to add a new tower and store it in localStorage
function addTowerToLocalStorage(latitude, longitude, height, assetId, heading, pitch, roll) {
  const towerId = Date.now(); // Generate a unique ID for the tower (timestamp)
  const towers = loadTowers();
  const newTower = { id: towerId, latitude, longitude, height, assetId, heading, pitch, roll };
  towers.push(newTower);
  saveTowers(towers); // Save the new tower to localStorage
  placeTower(newTower, towerId); // Place the tower on the map
}

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

// Listen for entity selection (for delete action)
viewer.selectedEntityChanged.addEventListener(function (entity) {
  if (entity && entity.id) {
    selectedTowerId = entity.id;
    document.getElementById('deleteTowerForm').style.display = 'block'; // Show delete button
  } else {
    document.getElementById('deleteTowerForm').style.display = 'none'; // Hide delete button if nothing is selected
  }
});

// Delete selected tower button event
document.getElementById('deleteSelectedTowerBtn').addEventListener('click', () => {
  if (selectedTowerId) {
    deleteTowerFromLocalStorage(selectedTowerId); // Delete the selected tower
  }
});
