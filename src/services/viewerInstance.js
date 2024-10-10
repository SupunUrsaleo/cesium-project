import { Viewer, CustomDataSource, Terrain, Ion } from 'cesium';
import 'cesium/Build/Cesium/Widgets/widgets.css';

window.CESIUM_BASE_URL = '/Cesium';
Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJhZTRmMDZhNS1jMTVmLTQxMTYtOGMwNi04NDAxMmJmOTZiYmEiLCJpZCI6MjQ0NTE5LCJpYXQiOjE3Mjc0MjgxMjJ9.JWqnRd89lZ2rwUKF44-bgZLvqRNDfHBPGEaNdKoEBB0';

export const viewer = new Viewer('cesiumContainer', {
  terrain: Terrain.fromWorldTerrain(),
});

export const dataSource = new CustomDataSource("towers");
viewer.dataSources.add(dataSource);
