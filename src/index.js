import { Cartesian3, createOsmBuildingsAsync, IonResource, Ion, Math as CesiumMath, Terrain, Viewer, Color, HeadingPitchRoll, Transforms, PinBuilder, VerticalOrigin, ScreenSpaceEventType } from 'cesium';
import 'cesium/Build/Cesium/Widgets/widgets.css';

// Set the base URL for static assets
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
const TOWER_PITCH = 90; // Hardcoded pitch for the tower

// Sample JSON data
const data = {
  "tower": {
    "location": {
      "latitude": 1.952786,
      "longitude": 102.682082,
      "ground_elevation_m": 12,
      "address": "Vacant Land, Lot 6349, Jalan Parit Subari Benting, Muar, Johor, Malaysia"
    },
    "structure": {
      "height_m": 45
    }
  },
  "antennas": [
    {
      "sector": 1,
      "model": "AG Hybrid Bi Sec AMB4519R18v06",
      "frequency_bands": ["GL900", "L1800", "L2100", "L2600", "Massive MIMO"],
      "height_agl_m": 43,
      "azimuth_degrees": 90,
      "mechanical_tilt_degrees": 0
    },
    {
      "sector": 2,
      "model": "Huawei DB 18/21 MM Antenna",
      "frequency_bands": ["L1800", "L2100", "Massive MIMO"],
      "height_agl_m": 44,
      "azimuth_degrees": 210,
      "mechanical_tilt_degrees": 0
    },
    {
      "sector": 3,
      "model": "AG QuadB AQU4518R11v06",
      "frequency_bands": ["GL900", "L1800", "L2100", "L2600"],
      "height_agl_m": 43,
      "azimuth_degrees": 300,
      "mechanical_tilt_degrees": 0
    }
  ]
};

// Function to load towers and equipments from JSON data
function loadTowerFromJSON(data) {
  const { latitude, longitude, ground_elevation_m } = data.tower.location;
  const towerHeight = data.tower.structure.height_m;

  // Log tower loading
  console.log("Loading tower at location:", latitude, longitude);

  // Place tower
  const towerId = Date.now(); // Generate a unique ID for the tower (timestamp)
  const newTower = { 
    id: towerId, 
    latitude, 
    longitude, 
    height: ground_elevation_m, 
    assetId: TOWER_ASSET_ID, 
    heading: 0, // No heading provided, default to 0
    pitch: TOWER_PITCH, // Hardcoded pitch value
    roll: 0, // No roll provided, default to 0
    equipments: [] // Empty array for equipments
  };
  placeTower(newTower, towerId); // Place the tower and pin on the map

  // Place equipments
  data.antennas.forEach(antenna => {
    const equipmentData = {
      assetId: EQUIPMENT_ASSET_ID,
      equipmentHeight: antenna.height_agl_m,
      azimuth: antenna.azimuth_degrees,
      tilt: antenna.mechanical_tilt_degrees,
      offset: EQUIPMENT_OFFSET
    };
    
    // Calculate offset position for the equipment
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
    id: `tower-${towerId.toString()}`, 
    position: position,
    model: { uri: towerUri },
    orientation: orientation,
    description: `
      <div style="font-family: Arial, sans-serif; padding: 10px; border-radius: 5px; background-color: #282828; color: #fff; border: 1px solid #ccc;">
        <h2 style="text-align: center; color: #fff;">Tower Information</h2>
        <p><strong>Latitude:</strong> ${tower.latitude}</p>
        <p><strong>Longitude:</strong> ${tower.longitude}</p>
        <p><strong>Height:</strong> ${tower.height} m</p>
      </div>`
  });

  viewer.entities.add({
    id: `pin-${towerId.toString()}`, 
    position: position,
    billboard: {
      image: pin,
      verticalOrigin: VerticalOrigin.BOTTOM
    }
  });
}

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

// Load the tower and equipments from the JSON data
loadTowerFromJSON(data);
