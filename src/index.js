import { Cartesian3, createOsmBuildingsAsync, IonResource, Ion, Math as CesiumMath, Terrain, Viewer, Color, HeadingPitchRoll, Transforms, PinBuilder, VerticalOrigin, ScreenSpaceEventType, CustomDataSource, BoundingSphere,HeadingPitchRange } from 'cesium';
import 'cesium/Build/Cesium/Widgets/widgets.css';

window.CESIUM_BASE_URL = '/Cesium';

// Set your Cesium ion access token
Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJhZTRmMDZhNS1jMTVmLTQxMTYtOGMwNi04NDAxMmJmOTZiYmEiLCJpZCI6MjQ0NTE5LCJpYXQiOjE3Mjc0MjgxMjJ9.JWqnRd89lZ2rwUKF44-bgZLvqRNDfHBPGEaNdKoEBB0';

const viewer = new Viewer('cesiumContainer', {
  terrain: Terrain.fromWorldTerrain(),
});

const TOWER_ASSET_ID = 2749930;
const EQUIPMENT_ASSET_ID = 2756072;
const EQUIPMENT_OFFSET = 1.5;
const TOWER_PITCH = 90;

let selectedTowerId = null;
let selectedTowerData = {};

// Sample JSON data
const data = [
  {
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
  },
  {
    "tower": {
      "location": {
        "latitude": 1.961229,
        "longitude": 102.689512,
        "ground_elevation_m": 10
      },
      "structure": {
        "height_m": 40
      }
    },
    "antennas": [
      {
        "height_agl_m": 38,
        "azimuth_degrees": 60,
        "mechanical_tilt_degrees": 1
      },
      {
        "height_agl_m": 39,
        "azimuth_degrees": 180,
        "mechanical_tilt_degrees": 1
      }
    ]
  },
  {
    "tower": {
      "location": {
        "latitude": 1.945342,
        "longitude": 102.675782,
        "ground_elevation_m": 8
      },
      "structure": {
        "height_m": 50
      }
    },
    "antennas": [
      {
        "height_agl_m": 48,
        "azimuth_degrees": 120,
        "mechanical_tilt_degrees": 2
      },
      {
        "height_agl_m": 47,
        "azimuth_degrees": 240,
        "mechanical_tilt_degrees": 2
      },
      {
        "height_agl_m": 49,
        "azimuth_degrees": 360,
        "mechanical_tilt_degrees": 0
      }
    ]
  },
  {
    "tower": {
      "location": {
        "latitude": 1.957789,
        "longitude": 102.671220,
        "ground_elevation_m": 15
      },
      "structure": {
        "height_m": 35
      }
    },
    "antennas": [
      {
        "height_agl_m": 33,
        "azimuth_degrees": 90,
        "mechanical_tilt_degrees": 3
      },
      {
        "height_agl_m": 32,
        "azimuth_degrees": 180,
        "mechanical_tilt_degrees": 3
      }
    ]
  },
  {
    "tower": {
      "location": {
        "latitude": 1.950234,
        "longitude": 102.688752,
        "ground_elevation_m": 20
      },
      "structure": {
        "height_m": 42
      }
    },
    "antennas": [
      {
        "height_agl_m": 41,
        "azimuth_degrees": 150,
        "mechanical_tilt_degrees": 1
      },
      {
        "height_agl_m": 40,
        "azimuth_degrees": 270,
        "mechanical_tilt_degrees": 1
      }
    ]
  }
];

function loadTowers() {
  const towersData = localStorage.getItem('towers');
  if (towersData) {
    return JSON.parse(towersData);
  }
  return [];
}


function saveTowers(tower) {
  let towers = loadTowers();

  // Check if a tower with the same latitude and longitude already exists
  const duplicateTower = towers.find(t => t.latitude === tower.latitude && t.longitude === tower.longitude);

  if (!duplicateTower) {
    // If no duplicate, add the new tower
    towers.push(tower);
    localStorage.setItem('towers', JSON.stringify(towers));
    console.log(`Tower with ID: ${tower.id} saved successfully.`);
  } else {
    console.log(`Duplicate tower at latitude: ${tower.latitude}, longitude: ${tower.longitude} not saved.`);
  }
}


const clusterOptions = {
  enabled: true,
  pixelRange: 50,
  minimumClusterSize: 2
};

const dataSource = new CustomDataSource("towers");

function enableClustering() {
  dataSource.clustering.enabled = clusterOptions.enabled;
  dataSource.clustering.pixelRange = clusterOptions.pixelRange;
  dataSource.clustering.minimumClusterSize = clusterOptions.minimumClusterSize;

  const pinBuilder = new PinBuilder();
  const clusterImage = pinBuilder.fromText("C", Color.GREEN, 48).toDataURL();

  dataSource.clustering.clusterEvent.addEventListener((clusteredEntities, cluster) => {
    cluster.label.show = false;
    cluster.billboard.show = true;
    
    // Set green pin for cluster
    const towerCount = clusteredEntities.length;
    const clusterText = `${towerCount}`;
    cluster.billboard.image = pinBuilder.fromText(clusterText, Color.GREEN, 48).toDataURL();
    
    // Event listener for cluster pin click
    cluster.billboard.id = `cluster-${Date.now()}`; // Unique ID for each cluster
    viewer.screenSpaceEventHandler.setInputAction((click) => {
      const pickedObject = viewer.scene.pick(click.position);
      if (pickedObject && pickedObject.id === cluster.billboard.id) {
        // Compute bounding sphere for clustered entities
        const positions = clusteredEntities.map(entity => entity.position.getValue(viewer.clock.currentTime));
        const boundingSphere = BoundingSphere.fromPoints(positions);
  
        // Fly to bounding sphere to zoom into the cluster scope
        viewer.camera.flyToBoundingSphere(boundingSphere, {
          duration: 3,
          offset: new HeadingPitchRange(0, CesiumMath.toRadians(-45), boundingSphere.radius * 2.0)
      });      
      }
    }, ScreenSpaceEventType.LEFT_CLICK);
  });
  
}

viewer.dataSources.add(dataSource);
enableClustering();

// Function to load towers from JSON and place them with prefix only in Cesium
function loadTowersFromJSON(dataArray) {
  dataArray.forEach((data, index) => {
    const { latitude, longitude, ground_elevation_m } = data.tower.location;
    const towerHeight = data.tower.structure.height_m;
    const towerId = `${Date.now()}-${index}`; // Generate ID without 'tower-' prefix

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

    // Place tower in Cesium with prefixed ID
    placeTower(newTower);

    // Process each antenna/equipment associated with this tower
    data.antennas.forEach((antenna, antennaIndex) => {
      const equipmentData = {
        assetId: EQUIPMENT_ASSET_ID, // Use the predefined asset ID
        equipmentHeight: antenna.height_agl_m,
        azimuth: antenna.azimuth_degrees,
        tilt: antenna.mechanical_tilt_degrees,
        offset: EQUIPMENT_OFFSET,
      };

      // Calculate the offset position for the equipment relative to the tower
      const equipmentPosition = calculateOffsetPosition(latitude, longitude, EQUIPMENT_OFFSET, equipmentData.azimuth);
      
      // Place equipment on the tower
      placeEquipment(equipmentData.assetId, equipmentPosition, equipmentData.equipmentHeight, equipmentData.tilt);
      
      // Add equipment data to the newTower object for saving
      newTower.equipments.push(equipmentData);
    });

    // Save tower (with equipment) to local storage
    saveTowers(newTower);
  });
}

// Function to place tower in Cesium
async function placeTower(tower) {
  const towerEntityId = `tower-${tower.id}`; // Prefix ID for Cesium
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

  dataSource.entities.add({
    id: towerEntityId, // Use prefixed ID here
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

  dataSource.entities.add({
    id: `pin-${tower.id}`,
    position: position,
    billboard: {
      image: pin,
      verticalOrigin: VerticalOrigin.BOTTOM
    }
  });
}

// Event handler to manage mouse click events for pins
// Event handler to manage mouse click events for pins
// Event handler to manage mouse click events for pins
viewer.screenSpaceEventHandler.setInputAction((click) => {
  const pickedObject = viewer.scene.pick(click.position);
  if (pickedObject && pickedObject.id) {
    const pickedId = pickedObject.id.id;

    if (pickedId.startsWith('pin-')) {
      const towerId = pickedId.split('pin-')[1];
      const towerEntity = dataSource.entities.getById(`tower-${towerId}`);
      
      if (towerEntity) {
        const position = towerEntity.position.getValue(Cesium.JulianDate.now());
        viewer.camera.flyTo({
          destination: position,
          duration: 3,
          orientation: {
            heading: viewer.camera.heading,
            pitch: viewer.camera.pitch,
            roll: 0.0,
          }
        });
      } else {
        console.error(`Tower entity with ID tower-${towerId} not found.`);
      }
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

viewer.screenSpaceEventHandler.setInputAction((movement) => {
  const pickedObject = viewer.scene.pick(movement.endPosition);

  // Check if pickedObject and pickedObject.id exist before proceeding
  if (pickedObject && pickedObject.id && pickedObject.id.id) {
    const pickedId = pickedObject.id.id;

    if (pickedId.startsWith('cluster-')) {
      // Green pin (cluster) logic remains on click or other event as needed
      // This could be left out of hover, or separated as needed
    } else if (pickedId.startsWith('pin-')) {
      // Blue pin (individual tower) logic remains the same
      const towerId = pickedId.split('pin-')[1];
      const towerEntity = dataSource.entities.getById(`tower-${towerId}`);
      
      if (towerEntity) {
        viewer.flyTo(towerEntity, { duration: 3 });
      } else {
        console.error(`Tower entity with ID tower-${towerId} not found.`);
      }
    } else if (pickedId.startsWith('tower-')) {
      // Logic for displaying tower details on hover
      selectedTowerId = pickedId.split('-')[1];

      // Retrieve the tower data from localStorage
      // Assuming selectedTowerId has already been set
      console.log("Looking for tower with ID:", selectedTowerId);
      const towers = loadTowers();
      console.log("Towers loaded from localStorage:", towers);
      
      const cleanId = selectedTowerId.split('-')[0]; // Take only the base ID before any suffix
      selectedTowerData = towers.find(tower => tower.id.startsWith(cleanId));

      if (selectedTowerData) {
          document.getElementById('towerInfo').innerHTML = `
              <p style="color: white;"><strong>Latitude:</strong> ${selectedTowerData.latitude}</p>
              <p style="color: white;"><strong>Longitude:</strong> ${selectedTowerData.longitude}</p>
              <p style="color: white;"><strong>Height:</strong> ${selectedTowerData.height} m</p>
          `;

      } else {
          console.warn("No data found for the selected tower ID.");
      }

      const infoTowerForm = document.getElementById('infoTowerForm');
      infoTowerForm.style.display = 'block';

    }
  } else {
    // Hide the tower info when not hovering over a tower
    document.getElementById('infoTowerForm').style.display = 'none';
  }
}, ScreenSpaceEventType.MOUSE_MOVE);

loadTowersFromJSON(data);
