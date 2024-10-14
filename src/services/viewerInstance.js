import { Viewer, CustomDataSource, Ion, createGooglePhotorealistic3DTileset, Rectangle, Color, Entity } from 'cesium';
import 'cesium/Build/Cesium/Widgets/widgets.css';

window.CESIUM_BASE_URL = '/Cesium';
Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJhZTRmMDZhNS1jMTVmLTQxMTYtOGMwNi04NDAxMmJmOTZiYmEiLCJpZCI6MjQ0NTE5LCJpYXQiOjE3Mjc0MjgxMjJ9.JWqnRd89lZ2rwUKF44-bgZLvqRNDfHBPGEaNdKoEBB0';

// Initialize viewer with the default globe
export const viewer = new Viewer('cesiumContainer', {
  timeline: false,
  animation: false,
  sceneModePicker: false,
  baseLayerPicker: false,
  globe: false,
});

// Add a Custom Data Source for towers
export const dataSource = new CustomDataSource("towers");
viewer.dataSources.add(dataSource);

// Function to load Google Photorealistic 3D Tiles
async function loadGooglePhotorealistic3D() {
  try {
    const google3DTiles = await createGooglePhotorealistic3DTileset();
    viewer.scene.primitives.add(google3DTiles);
  } catch (error) {
    console.error("Error loading Google Photorealistic 3D Tiles:", error);
  }
}

// Function to add a global red layer
function addGlobalRedLayer() {
  const worldRectangleEntity = new Entity({
    rectangle: {
      coordinates: Rectangle.fromDegrees(-180, -90, 180, 90),
      material: Color.RED.withAlpha(0.5),  // Apply a semi-transparent red color
    }
  });
  
  viewer.entities.add(worldRectangleEntity);
}

// Load 3D tiles and apply the red layer
loadGooglePhotorealistic3D();
addGlobalRedLayer();
