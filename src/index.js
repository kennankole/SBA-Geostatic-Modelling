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
