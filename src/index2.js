import { Cartesian3, createOsmBuildingsAsync, IonResource, Ion, Math as CesiumMath, Terrain, Viewer, Color, HeadingPitchRoll, Transforms, PinBuilder, VerticalOrigin, ScreenSpaceEventType, CustomDataSource, BoundingSphere, HeadingPitchRange, PolygonHierarchy, ClassificationType } from 'cesium';
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
  },
  {
    "tower": {
      "location": {
        "latitude": 45.0023,
        "longitude": 45.0015,
        "ground_elevation_m": 40
      },
      "structure": {
        "height_m": 55
      }
    },
    "antennas": [
      {
        "height_agl_m": 50,
        "azimuth_degrees": 90,
        "mechanical_tilt_degrees": 2
      },
      {
        "height_agl_m": 53,
        "azimuth_degrees": 180,
        "mechanical_tilt_degrees": 3
      }
    ]
  },
  {
    "tower": {
      "location": {
        "latitude": 45.0048,
        "longitude": 45.0123,
        "ground_elevation_m": 40
      },
      "structure": {
        "height_m": 60
      }
    },
    "antennas": [
      {
        "height_agl_m": 58,
        "azimuth_degrees": 270,
        "mechanical_tilt_degrees": 1
      }
    ]
  },
  {
    "tower": {
      "location": {
        "latitude": 45.0302,
        "longitude": 45.0301,
        "ground_elevation_m": 40
      },
      "structure": {
        "height_m": 50
      }
    },
    "antennas": [
      {
        "height_agl_m": 45,
        "azimuth_degrees": 45,
        "mechanical_tilt_degrees": 0
      },
      {
        "height_agl_m": 47,
        "azimuth_degrees": 135,
        "mechanical_tilt_degrees": 1
      }
    ]
  },
  {
    "tower": {
      "location": {
        "latitude": 45.0567,
        "longitude": 45.0668,
        "ground_elevation_m": 40
      },
      "structure": {
        "height_m": 65
      }
    },
    "antennas": [
      {
        "height_agl_m": 60,
        "azimuth_degrees": 90,
        "mechanical_tilt_degrees": 2
      },
      {
        "height_agl_m": 62,
        "azimuth_degrees": 210,
        "mechanical_tilt_degrees": 1
      }
    ]
  },
  {
    "tower": {
      "location": {
        "latitude": 45.0891,
        "longitude": 45.0785,
        "ground_elevation_m": 40
      },
      "structure": {
        "height_m": 70
      }
    },
    "antennas": [
      {
        "height_agl_m": 65,
        "azimuth_degrees": 0,
        "mechanical_tilt_degrees": 0
      },
      {
        "height_agl_m": 68,
        "azimuth_degrees": 180,
        "mechanical_tilt_degrees": 2
      }
    ]
  },
  {
    "tower": {
      "location": {
        "latitude": 45.0732,
        "longitude": 45.0456,
        "ground_elevation_m": 40
      },
      "structure": {
        "height_m": 58
      }
    },
    "antennas": [
      {
        "height_agl_m": 54,
        "azimuth_degrees": 120,
        "mechanical_tilt_degrees": 1
      },
      {
        "height_agl_m": 56,
        "azimuth_degrees": 240,
        "mechanical_tilt_degrees": 2
      }
    ]
  },
  {
    "tower": {
      "location": {
        "latitude": 45.0917,
        "longitude": 45.0992,
        "ground_elevation_m": 40
      },
      "structure": {
        "height_m": 63
      }
    },
    "antennas": [
      {
        "height_agl_m": 60,
        "azimuth_degrees": 30,
        "mechanical_tilt_degrees": 0
      },
      {
        "height_agl_m": 62,
        "azimuth_degrees": 300,
        "mechanical_tilt_degrees": 1
      }
    ]
  },
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
  const duplicateTower = towers.find(t => t.latitude === tower.latitude && t.longitude === tower.longitude);

  if (!duplicateTower) {
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
    
    const towerCount = clusteredEntities.length;
    const clusterText = `${towerCount}`;
    cluster.billboard.image = pinBuilder.fromText(clusterText, Color.GREEN, 48).toDataURL();
    
    cluster.billboard.id = `cluster-${Date.now()}`;
    viewer.screenSpaceEventHandler.setInputAction((click) => {
      const pickedObject = viewer.scene.pick(click.position);
      if (pickedObject && pickedObject.id === cluster.billboard.id) {
        const positions = clusteredEntities.map(entity => entity.position.getValue(viewer.clock.currentTime));
        const boundingSphere = BoundingSphere.fromPoints(positions);
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

function loadTowersFromJSON(dataArray) {
  dataArray.forEach((data, index) => {
    const { latitude, longitude, ground_elevation_m } = data.tower.location;
    const towerId = `${Date.now()}-${index}`;

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

    placeTower(newTower);

    data.antennas.forEach((antenna) => {
      const equipmentData = {
        assetId: EQUIPMENT_ASSET_ID,
        equipmentHeight: antenna.height_agl_m,
        azimuth: antenna.azimuth_degrees,
        tilt: antenna.mechanical_tilt_degrees,
        offset: EQUIPMENT_OFFSET,
      };
      const equipmentPosition = calculateOffsetPosition(latitude, longitude, EQUIPMENT_OFFSET, equipmentData.azimuth);
      placeEquipment(equipmentData.assetId, equipmentPosition, equipmentData.equipmentHeight, equipmentData.tilt);
      newTower.equipments.push(equipmentData);
    });

    saveTowers(newTower);

    addSignalClassification(newTower); // Add classification for each tower
  });
}

// Initial radius value
let radius = 100;

// Function to add signal classification with adjustable radius
function addSignalClassification(tower) {
  const circleEntity = viewer.entities.add({
    position: Cartesian3.fromDegrees(tower.longitude, tower.latitude),
    ellipse: {
      semiMinorAxis: radius,
      semiMajorAxis: radius,
      material: Color.BLUE.withAlpha(0.3),
      classificationType: ClassificationType.BOTH
    }
  });

  // Update function to change the radius dynamically
  document.getElementById('radiusSlider').addEventListener('input', (event) => {
    radius = Number(event.target.value);
    circleEntity.ellipse.semiMinorAxis = radius;
    circleEntity.ellipse.semiMajorAxis = radius;
    document.getElementById('radiusValue').textContent = radius; // Update radius display
  });
}

async function placeTower(tower) {
  const towerEntityId = `tower-${tower.id}`;
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
    id: towerEntityId,
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

function deleteTowerFromLocalStorage(towerId) {
  viewer.entities.removeById(`tower-${towerId}`);
  viewer.entities.removeById(`pin-${towerId}`);
  document.getElementById('infoTowerForm').style.display = 'none';
  selectedTowerId = null;
}

document.getElementById("closeBtn").onclick = function() {
  document.getElementById("infoTowerForm").style.display = "none";
};

function calculateOffsetPosition(latitude, longitude, offset, azimuth) {
  const R = 6371000;
  const latOffset = offset / R * (180 / Math.PI);
  const lonOffset = offset / (R * Math.cos(Math.PI * latitude / 180)) * (180 / Math.PI);

  const newLatitude = latitude + latOffset * Math.cos(CesiumMath.toRadians(azimuth));
  const newLongitude = longitude + lonOffset * Math.sin(CesiumMath.toRadians(azimuth));

  return { latitude: newLatitude, longitude: newLongitude };
}

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
  if (pickedObject && pickedObject.id && pickedObject.id.id) {
    const pickedId = pickedObject.id.id;

    if (pickedId.startsWith('pin-')) {
      const towerId = pickedId.split('pin-')[1];
      const towerEntity = dataSource.entities.getById(`tower-${towerId}`);
      
      if (towerEntity) {
        // viewer.flyTo(towerEntity, { duration: 3 });
      } else {
        console.error(`Tower entity with ID tower-${towerId} not found.`);
      }
    } else if (pickedId.startsWith('tower-')) {
      selectedTowerId = pickedId.split('-')[1];

      const towers = loadTowers();
      const cleanId = selectedTowerId.split('-')[0];
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
    document.getElementById('infoTowerForm').style.display = 'none';
  }
}, ScreenSpaceEventType.MOUSE_MOVE);

loadTowersFromJSON(data);
