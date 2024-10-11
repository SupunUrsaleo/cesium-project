import { loadTowersFromJSON } from './components/Tower';
import { viewer, dataSource } from './services/viewerInstance';
import { enableClustering, setupEventHandlers } from './services/CesiumService';

import './styles/main.css';
// Add the data source to the viewer
// viewer.dataSources.add(dataSource);

// Enable clustering and set up event handlers
enableClustering();
setupEventHandlers();

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

loadTowersFromJSON(data);

