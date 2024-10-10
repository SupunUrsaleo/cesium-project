import { Cartesian3, IonResource, Math as CesiumMath, Transforms, HeadingPitchRoll, PinBuilder, Color, ScreenSpaceEventType, BoundingSphere, HeadingPitchRange, VerticalOrigin } from 'cesium';
import { viewer, dataSource } from './viewerInstance';
import { saveTowers, loadTowers } from '../services/StorageService';

// Display and hide tower information functions
function displayTowerInfo(towerId) {
  const towerEntity = dataSource.entities.getById(towerId);
  if (towerEntity) {
    const towerInfo = document.getElementById('towerInfo');
    towerInfo.innerHTML = `
      <p style="color: white;"><strong>Latitude:</strong> ${towerEntity.position.getValue().latitude}</p>
      <p style="color: white;"><strong>Longitude:</strong> ${towerEntity.position.getValue().longitude}</p>
      <p style="color: white;"><strong>Height:</strong> ${towerEntity.position.getValue().height} m</p>
    `;
    document.getElementById('infoTowerForm').style.display = 'block';
  }
}

function hideTowerInfo() {
  document.getElementById('infoTowerForm').style.display = 'none';
}

let selectedTowerId = null;
let selectedTowerData = {};

// Function to enable clustering
export function enableClustering() {
  dataSource.clustering.enabled = true;
  dataSource.clustering.pixelRange = 50;
  dataSource.clustering.minimumClusterSize = 2;

  const pinBuilder = new PinBuilder();

  // Cluster event listener to handle cluster appearance and interaction
  dataSource.clustering.clusterEvent.addEventListener((clusteredEntities, cluster) => {
    // Hide default label and ensure billboard is shown
    cluster.label.show = false;
    cluster.billboard.show = true;

    // Set the cluster image to a green pin with the number of entities in it
    const towerCount = clusteredEntities.length;
    const clusterText = `${towerCount}`;
    cluster.billboard.image = pinBuilder.fromText(clusterText, Color.GREEN, 48).toDataURL();
    cluster.billboard.verticalOrigin = VerticalOrigin.BOTTOM;

    // Set an ID to recognize the cluster in event handlers
    cluster.billboard.id = `cluster-${Date.now()}`;

    // Event handler for cluster clicks
    viewer.screenSpaceEventHandler.setInputAction((click) => {
      const pickedObject = viewer.scene.pick(click.position);
      if (pickedObject && pickedObject.id === cluster.billboard.id) {
        // Fly to the bounding sphere around the clustered entities
        const positions = clusteredEntities.map(entity => entity.position.getValue(viewer.clock.currentTime));
        const boundingSphere = BoundingSphere.fromPoints(positions);
        viewer.camera.flyToBoundingSphere(boundingSphere, {
          duration: 3,
          offset: new HeadingPitchRange(0, CesiumMath.toRadians(-45), boundingSphere.radius * 2.0)
        });
      }
    }, ScreenSpaceEventType.LEFT_CLICK);
  });

  // viewer.dataSources.add(dataSource); // Ensure dataSource is added to the viewer
}

// Function to set up event handlers for towers
// Function to set up event handlers for towers and clusters
export function setupEventHandlers() {
  // LEFTCLICK for individual towers and clusters
  viewer.screenSpaceEventHandler.setInputAction((click) => {
    const pickedObject = viewer.scene.pick(click.position);
    if (pickedObject && pickedObject.id) {
      const pickedId = pickedObject.id.id || pickedObject.id; // Ensure to handle both cases

      // Check if the picked object is a tower pin
      if (typeof pickedId === 'string' && pickedId.startsWith('pin-')) {
        const towerId = pickedId.split('pin-')[1];
        const towerEntity = dataSource.entities.getById(`tower-${towerId}`);
        if (towerEntity) {
          const position = towerEntity.position.getValue(viewer.clock.currentTime);
          viewer.camera.flyTo({
            destination: position,
            duration: 3
          });
          displayTowerInfo(`tower-${towerId}`);
        }
      } else if (pickedObject.id === cluster.billboard.id) {
        // If it’s a cluster, handle clustering behavior
        const clusteredEntities = pickedObject.clusteredEntities;
        if (clusteredEntities) {
          const positions = clusteredEntities.map(entity => entity.position.getValue(viewer.clock.currentTime));
          const boundingSphere = BoundingSphere.fromPoints(positions);
          viewer.camera.flyToBoundingSphere(boundingSphere, {
            duration: 3,
            offset: new HeadingPitchRange(0, CesiumMath.toRadians(-45), boundingSphere.radius * 2.0)
          });
        }
      }
    }
  }, ScreenSpaceEventType.LEFT_CLICK);

  // MOUSE_MOVE for hover effect on towers
  viewer.screenSpaceEventHandler.setInputAction((movement) => {
    const pickedObject = viewer.scene.pick(movement.endPosition);
    if (pickedObject && pickedObject.id && pickedObject.id.id) {
      const pickedId = pickedObject.id.id;
  
      if (pickedId.startsWith('pin-')) {
        const towerId = pickedId.split('pin-')[1];
        const towerEntity = dataSource.entities.getById(`tower-${towerId}`);
        
        if (towerEntity) {
          // Here you could implement camera flyTo functionality if needed
        } else {
          console.error(`Tower entity with ID tower-${towerId} not found.`);
        }
      } else if (pickedId.startsWith('tower-')) {
        selectedTowerId = pickedId.split('-')[1];
        const towers = loadTowers();

        selectedTowerData = towers.find(tower => tower.id.startsWith(selectedTowerId));
        
        // Ensure loadTowers is returning valid data
        console.log("Loaded towers:", towers);
        console.log("Selected Tower ID:", selectedTowerId);
  
        if (selectedTowerData) {
          document.getElementById('towerInfo').innerHTML = `
            <p style="color: white;"><strong>Latitude:</strong> ${selectedTowerData.latitude}</p>
            <p style="color: white;"><strong>Longitude:</strong> ${selectedTowerData.longitude}</p>
            <p style="color: white;"><strong>Height:</strong> ${selectedTowerData.height} m</p>
          `;
          document.getElementById('infoTowerForm').style.display = 'block';
        } else {
          console.warn("No data found for the selected tower ID:", selectedTowerId);
          document.getElementById('infoTowerForm').style.display = 'none';
        }
      }
    } else {
      document.getElementById('infoTowerForm').style.display = 'none';
    }
  }, ScreenSpaceEventType.MOUSE_MOVE);
  
}


// Function to add a tower entity to the dataSource
export async function placeTower(tower) {
  const position = Cartesian3.fromDegrees(tower.longitude, tower.latitude, tower.height);
  const orientation = Transforms.headingPitchRollQuaternion(
    position,
    new HeadingPitchRoll(CesiumMath.toRadians(tower.heading), CesiumMath.toRadians(tower.pitch), CesiumMath.toRadians(tower.roll))
  );

  const towerEntityId = `tower-${tower.id}`;
  const towerUri = await IonResource.fromAssetId(tower.assetId);
  const pinBuilder = new PinBuilder();
  const pin = pinBuilder.fromText("T", Color.BLUE, 48).toDataURL();

  dataSource.entities.add({
    id: towerEntityId,
    position: position,
    model: { uri: towerUri },
    orientation: orientation,
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

// Function to add equipment to the map
export async function placeEquipment(assetId, position, height, tilt) {
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
