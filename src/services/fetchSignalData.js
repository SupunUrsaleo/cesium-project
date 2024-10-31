const Connector = require("@heavyai/connector/dist/node-connector.js").DbCon;
const fs = require('fs');

// Configuration settings
const config = {
  hostname: '3.144.161.90', // Your HEAVY.AI host
  protocol: 'http',          // HTTP or HTTPS
  port_num: '6278',          // Default port
  database: 'heavyai',       // Database name
  username: 'admin',         // Username
  password: 'HyperInteractive', // Password
};

// Ensure all config properties are set
Object.keys(config).forEach(propertyName => {
  const propertyValue = config[propertyName];
  if (typeof propertyValue !== 'string') exitError(`missing heavydb config property ${propertyName}`);
});

// Create and configure the connector
const connector = new Connector()
  .protocol(config.protocol)
  .host(config.hostname)
  .port(config.port_num)
  .dbName(config.database)
  .user(config.username)
  .password(config.password);

console.log(`Connecting to HEAVY.AI...`);

connector.connectAsync()
  .then(session => {
    console.log(`Connection succeeded!`);
    return executeQueryWithTimeout(session, 60000);  // Set a 60-second timeout for the query due to its complexity
  })
  .then(data => {
    const jsonData = JSON.stringify(data, null, 2); // Format data as JSON

    // Save the result to a JSON file
    fs.writeFileSync('seattle_downtown_rf_prop_max_signal.json', jsonData);
    console.log('File has been written successfully!');
  })
  .catch(err => {
    console.log(`Error:`, err);  
    exitError(err);
  });

// Function to execute a query with a custom timeout using Promise.race()
async function executeQueryWithTimeout(session, timeout) {
  const query = `
    SELECT * 
    FROM
        TABLE(
          tf_rf_prop_max_signal(
            rf_sources => CURSOR (
                  SELECT
                    global_cell_id,
                    CAST(st_x(location) AS DOUBLE),
                    CAST(st_y(location) AS DOUBLE),
                    CAST(height_agl AS DOUBLE),
                    CAST(80.0 AS DOUBLE) AS tx_power_watts,
                    CAST(2100.0 AS DOUBLE) AS tx_freq_mhz,
                    antenna_azimuth,
                    antenna_downtilt, 
                    antenna_type
                  FROM seattle_downtown_cell_towers_lte_verizon_directional_cleaned
            ),
            terrain_elevations => CURSOR (
                  SELECT
                  cast(ST_X(location) AS double) AS x,
                  cast(ST_Y(location) AS double) AS y,
                  CAST(ground_amsl AS DOUBLE) AS terrain_amsl,
                  CAST(clutter_amsl AS DOUBLE) AS clutter_amsl,
                  CAST(CASE WHEN clutter_type = 'building' THEN 1.0 
                            WHEN clutter_type = 'vegetation' THEN 1.4 
                            ELSE 1.2 END AS double) AS terrain_attenuation_dbm_per_meter
              FROM seattle_downtown_maxar_clutter_50cm_utm
            ),
            antenna_patterns => CURSOR(
              SELECT name, cast(0.0 AS double) AS gain, h_pattern_key, h_pattern_value, v_pattern_key, v_pattern_value 
              FROM antenna_types
            ),
            rf_source_z_is_relative_to_terrain => TRUE,
            geographic_coords => TRUE,
            bin_dim_meters => 10,
            assumed_receiver_height_agl => 2.0,
            max_ray_travel_meters => 5000,
            initial_rays_per_source => 64,
            rays_per_bin_autosplit_threshold => 1.5,
            min_receiver_signal_strength_dbm => -130.0,
            default_source_height_agl_meters => 20.0,
            ray_step_bin_multiple => 1.0,
            loop_grain_size => 4
          )
        )
    LIMIT 10;
  `;

  console.log(`Sending query to HEAVY.AI: ${query}`);

  // Create a promise that will reject after the timeout
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Query timed out')), timeout);
  });

  // Run the query and race it against the timeout
  try {
    return await Promise.race([
      session.queryAsync(query),   // The actual query
      timeoutPromise               // The timeout promise
    ]);
  } catch (err) {
    throw new Error('Query failed or timed out');
  }
}

// Error handling function
function exitError(err) {
  console.error(err);
  process.exit(1001);
}
