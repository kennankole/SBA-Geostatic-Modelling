// Load the Kenya boundary as a region of interest
var kenya = ee.FeatureCollection('USDOS/LSIB_SIMPLE/2017')
                .filter(ee.Filter.eq('country_na', 'Kenya'));

var geometry = kenya.geometry();

// Load the dataset
var dataset = ee.ImageCollection('NOAA/VIIRS/DNB/MONTHLY_V1/VCMCFG');

// Filter the dataset by date and region
var filtered = dataset.filterDate('2014-01-01', '2014-12-31')
                      .filterBounds(geometry);

// Calculate the mean NTL value for each image in the collection
var mean = filtered.mean();

// Clip the mean NTL image to the Kenya boundary
var clippedMean = mean.clip(geometry);

// Convert the clipped NTL image to a FeatureCollection
var featureCollection = clippedMean.toInt().reduceToVectors({
  geometry: geometry,
  scale: 30,
  maxPixels: 1e12,
  geometryType: 'polygon',
  eightConnected: false,
  labelProperty: 'ntl_value',
  reducer: ee.Reducer.mean()
});

// Export the NTL data as a CSV file to your local machine
Export.table.toDrive({
  collection: featureCollection,
  description: 'clipped_ntl_data',
  fileFormat: 'CSV',
});

// Digital Elevation Model
// Load ASTER GDEM data
var dem = ee.Image('USGS/SRTMGL1_003');

// Extract elevation band from the DEM data
var elevation = dem.select('elevation');

// Define the region of interest (Kenya)
var kenya = ee.FeatureCollection('USDOS/LSIB_SIMPLE/2017')
              .filter(ee.Filter.eq('country_na', 'Kenya'));

// Clip the DEM by the Kenya region
var clippedDem = elevation.clip(kenya);

// Define visualization parameters
var visParams = {
  min: -100,
  max: 8000,
  palette: '000000, FFFFFF'
};

// Add clipped DEM layer to the map
Map.addLayer(clippedDem, visParams, 'Clipped ASTER GDEM');

// Export the clipped DEM as GeoTIFF
Export.image.toDrive({
  image: clippedDem,
  description: 'aster_dem_clip',
  scale: 30,
  maxPixels: 1e12,
  region: kenya.geometry(),
  fileFormat: 'GeoTIFF'
});