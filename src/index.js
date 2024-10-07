import { Cartesian3, createOsmBuildingsAsync, IonResource, Ion, Math as CesiumMath, Terrain, Viewer, Color, HeadingPitchRoll, Transforms, PinBuilder, VerticalOrigin, ScreenSpaceEventType } from 'cesium';
import 'cesium/Build/Cesium/Widgets/widgets.css';

window.CESIUM_BASE_URL = '/Cesium';

// Set your Cesium ion access token
Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJhZTRmMDZhNS1jMTVmLTQxMTYtOGMwNi04NDAxMmJmOTZiYmEiLCJpZCI6MjQ0NTE5LCJpYXQiOjE3Mjc0MjgxMjJ9.JWqnRd89lZ2rwUKF44-bgZLvqRNDfHBPGEaNdKoEBB0';

// Initialize Cesium Viewer
const viewer = new Viewer('cesiumContainer', {
  terrain: Terrain.fromWorldTerrain(),
});

const TOWER_ASSET_ID = 2749930;
const EQUIPMENT_ASSET_ID = 2756072;
const EQUIPMENT_OFFSET = 1.5;
const TOWER_PITCH = 90; // Fixed pitch for tower orientation

// Declare variables to track the selected tower
let selectedTowerId = null;
let selectedTowerData = {};

// Sample JSON data
const data = {
  "tower": {
    "location": {
      "latitude": 1.952786,
      "longitude": 102.682082,
      "ground_elevation_m": 12
    },
    "structure": {
      "height_m": 45
    }
  },
  "antennas": [
    {
      "height_agl_m": 43,
      "azimuth_degrees": 90,
      "mechanical_tilt_degrees": 0
    },
    {
      "height_agl_m": 44,
      "azimuth_degrees": 210,
      "mechanical_tilt_degrees": 0
    },
    {
      "height_agl_m": 43,
      "azimuth_degrees": 300,
      "mechanical_tilt_degrees": 0
    }
  ]
};

// Load towers and equipments from JSON data
function loadTowerFromJSON(data) {
  const { latitude, longitude, ground_elevation_m } = data.tower.location;
  const towerHeight = data.tower.structure.height_m;

  const towerId = Date.now(); 
  const newTower = { 
    id: towerId, 
    latitude, 
    longitude, 
    height: ground_elevation_m, 
    assetId: TOWER_ASSET_ID, 
    heading: 0, 
    pitch: TOWER_PITCH, 
    roll: 0,
    equipments: [] 
  };
  
  // Set the tower data directly
  selectedTowerData = newTower;
  placeTower(newTower, towerId);

  // Load equipments
  data.antennas.forEach((antenna, index) => {
    const equipmentData = {
      assetId: EQUIPMENT_ASSET_ID,
      equipmentHeight: antenna.height_agl_m,
      azimuth: antenna.azimuth_degrees,
      tilt: antenna.mechanical_tilt_degrees,
      offset: EQUIPMENT_OFFSET
    };

    const equipmentPosition = calculateOffsetPosition(latitude, longitude, EQUIPMENT_OFFSET, equipmentData.azimuth);
    placeEquipment(equipmentData.assetId, equipmentPosition, equipmentData.equipmentHeight, equipmentData.tilt);
  });
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

  const pinBuilder = new PinBuilder();
  const pin = pinBuilder.fromText("T", Color.BLUE, 48).toDataURL();

  viewer.entities.add({
    id: `tower-${towerId}`, 
    position: position,
    model: { uri: towerUri },
    orientation: orientation,
    description: `
      <div style="font-family: Arial, sans-serif; padding: 10px; background-color: #282828; color: #fff;">
        <h2 style="text-align: center; color: #fff;">Tower Information</h2>
        <p><strong>Latitude:</strong> ${tower.latitude}</p>
        <p><strong>Longitude:</strong> ${tower.longitude}</p>
        <p><strong>Height:</strong> ${tower.height} m</p>
      </div>`
  });

  viewer.entities.add({
    id: `pin-${towerId}`, 
    position: position,
    billboard: {
      image: pin,
      verticalOrigin: VerticalOrigin.BOTTOM
    }
  });
}

// Event handler to manage mouse click events for pins
viewer.screenSpaceEventHandler.setInputAction((click) => {
  const pickedObject = viewer.scene.pick(click.position);
  if (pickedObject && pickedObject.id) {
    const pickedId = pickedObject.id.id;

    if (pickedId.startsWith('pin-')) {
      const towerId = pickedId.split('pin-')[1];
      viewer.flyTo(viewer.entities.getById(`tower-${towerId}`), {
        duration: 3
      });
    }

    if (pickedId.startsWith('tower-')) {
      selectedTowerId = pickedId.split('-')[1];

      document.getElementById('towerInfo').innerHTML = `
        <p style="color: white;"><strong>Latitude:</strong> ${selectedTowerData.latitude}</p>
        <p style="color: white;"><strong>Longitude:</strong> ${selectedTowerData.longitude}</p>
        <p style="color: white;"><strong>Height:</strong> ${selectedTowerData.height} m</p>
      `;
      document.getElementById('infoTowerForm').style.display = 'block';
    }
  }
}, ScreenSpaceEventType.LEFT_CLICK);

// Function to delete tower and pin from Cesium viewer
function deleteTowerFromLocalStorage(towerId) {
  viewer.entities.removeById(`tower-${towerId}`);
  viewer.entities.removeById(`pin-${towerId}`);
  document.getElementById('infoTowerForm').style.display = 'none';
  selectedTowerId = null;
}

// Close popup when clicking on the close button
document.getElementById("closeBtn").onclick = function() {
  document.getElementById("infoTowerForm").style.display = "none";
};

// Function to calculate equipment position offset from the tower
function calculateOffsetPosition(latitude, longitude, offset, azimuth) {
  const R = 6371000;
  const latOffset = offset / R * (180 / Math.PI);
  const lonOffset = offset / (R * Math.cos(Math.PI * latitude / 180)) * (180 / Math.PI);

  const newLatitude = latitude + latOffset * Math.cos(CesiumMath.toRadians(azimuth));
  const newLongitude = longitude + lonOffset * Math.sin(CesiumMath.toRadians(azimuth));

  return { latitude: newLatitude, longitude: newLongitude };
}

// Function to place equipment on the map
async function placeEquipment(assetId, position, height, tilt) {
  const equipmentUri = await IonResource.fromAssetId(assetId);

  const orientation = Transforms.headingPitchRollQuaternion(
    Cartesian3.fromDegrees(position.longitude, position.latitude, height),
    new HeadingPitchRoll(CesiumMath.toRadians(0), CesiumMath.toRadians(tilt), 0)
  );

  viewer.entities.add({
    position: Cartesian3.fromDegrees(position.longitude, position.latitude, height),
    model: { uri: equipmentUri },
    orientation: orientation
  });
}

// Load the tower and equipments from JSON data
loadTowerFromJSON(data);
