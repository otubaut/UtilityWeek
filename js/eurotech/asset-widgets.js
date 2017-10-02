var windDirectionRadial;
var panTiltRadial;
/*
* Widget initialization
*/
function initAssetWidgets () {
  createDirectionRadial();
  createPanTiltRadial();
  updateDirection();
  updatePanTilt();
  updateTemperature();
  updatelightPresence();
  updatecurrentTwenty();
  updateHumidity();
  updateAssetWidget();
  drawAssetMap();
}

// Get delta of two positions to see if they are close enough to be considered the same place.
function checkPosition(marker, markers) {
  if (marker[1] == 0 && marker[2] == 0) {
    return false;
  }
  for (var i in markers) {
    if ((Math.abs(marker[1] - markers[i][1]) < 0.001)
          && (Math.abs(marker[2] - markers[i][2]) < 0.001)) {
      return false;
    }
  }
  return true;

}
function drawAssetMap() {
  getPositionData(function (data){
    var markers = [];
    for (var i in data.message) {
      var metrics = getMetrics(data.message[i].payload.metrics.metric);
      var marker = ['Gateway', metrics.latitude, metrics.longitude];

      if (checkPosition(marker, markers)) {
        markers.push(marker);
      }
    }
    initAssetMap(markers);

  });
}
function createDirectionRadial() {
  windDirectionRadial = new steelseries.Compass('windDirectionRadial', {});
  windDirectionRadial.setBackgroundColor(steelseries.BackgroundColor.MUD);
  windDirectionRadial.setFrameDesign(steelseries.FrameDesign.TILTED_BLACK);
}
function createPanTiltRadial() {
  panTiltRadial = new steelseries.Horizon('panTiltRadial', {size: 201});
  panTiltRadial.setFrameDesign(steelseries.FrameDesign.TILTED_BLACK);
}
/*
* Update functions
*/
function updateTemperature() {
  var temperature = fahrenheitToCelsius(monnitSensors.temperature.temperature);
  $("#asset-temp-text").html(temperature);
  if (expandedView == 'temperature'){
    updateAssetTemperatureExpansion()
  }
}
function updatecurrentTwenty() {
  var MaxCurrent = monnitSensors.currentTwenty.MaxCurrent;
  $("#currentTwenty-MaxCurrent-text").html(MaxCurrent);
  if (expandedView == 'MaxCurrent'){
    updateAssetMaxCurrentExpansion()
  }
}
function updateHumidity() {
  var humidity = monnitSensors.humidityTemperature.relativeHumidity;
  $("#asset-humidity-text").html(humidity.toFixed(1) + "%");
  $("#asset-humidityTemperature-signal").html(monnitSensors.direction.signal + "%");
  $("#asset-humidityTemperature-rssi").html(monnitSensors.direction.rssi);
}
function updateDirection() {
  var direction = monnitSensors.direction.direction;
  $("#asset-direction").html(direction.toFixed(1) + "°");
  updateDirectionRadial(direction);
  $("#asset-direction-signal").html(monnitSensors.direction.signal + "%");
  $("#asset-direction-rssi").html(monnitSensors.direction.rssi);
}
function updateDirectionRadial(direction) {
  windDirectionRadial.setValueAnimated(direction);
}
function updatePanTilt() {
  var pitch = monnitSensors.panTilt.pitch.toFixed(1);
  var roll = monnitSensors.panTilt.roll.toFixed(1);
  $("#asset-pan").html(pitch + "°");
  $("#asset-tilt").html(roll + "°");
  updatePanTiltRadial(pitch, roll);
  $("#asset-pantilt-signal").html(monnitSensors.panTilt.signal + "%");
  $("#asset-pantilt-rssi").html(monnitSensors.panTilt.rssi);
}
function updatePanTiltRadial(pitch, roll) {
  var horizon = pitch-90;
  if (horizon > 90) {
    horizon = 90;
  } else if (horizon < -90) {
    horizon = -90;
  }
  panTiltRadial.setPitchAnimated(horizon*-1);
  panTiltRadial.setRollAnimated(roll);
}
function updateAssetWidget(){
  if (checkAssetSensor()) {
    $("#asset-asset-widget-text").html('<span class="glyphicon glyphicon-ok text-success"></span>&nbspAsset Arrived');
  } else {
    $("#asset-asset-widget-text").html('<span class="glyphicon glyphicon-exclamation-sign text-danger"></span>&nbspAsset Missing!');
  }
}
/*
 * Direction expansions
 */
function directionOpenAssetExpansion () {
  $("#asset-direction-expanded-content").fadeIn();
}
function directionCloseAssetExpansion () {

}
/*
 * Humidity expansions
 */
function humidityAssetExpansion() {
  $("#asset-humidityTemperature-expanded-content").fadeIn();
}
/*
 * Pan/tilt expansions
 */
function panTiltCloseAssetExpansion () {

}
function panTiltOpenAssetExpansion () {
  $("#asset-pantilt-expanded-content").fadeIn();
}
/**
 * Temperature expansion
 */
function temperatureAssetExpansion(startDate, endDate) {
  //Since each expanded view is bespoke, their minimum sizes need to be specific.
  var elementID = "#"  + "asset-" + expandedView + "-expanded";
  $(elementID).css({'min-height': '65px'});

  // Default to past hour.
  if (startDate == undefined) {
    var startDate = moment().subtract(1, 'hours').unix() * 1000;
    var endDate = moment().unix() * 1000;
  }

  getMonnitSensorHistory ("temperature", startDate, endDate, function(data){

    var tempTraces = [];
    var lowestTemp = 1000;
    var highestTemp = -1000;

		if (data.message == undefined) {
      lowestTemp = "Unknown";
      highestTemp = "Unknown";
		}

    for (var i in data.message) {
      var metrics = getMetrics(data.message[i].payload.metrics.metric);
      var temp = Number(metrics.temperature);
      if (temp < lowestTemp) lowestTemp = temp;
      if (temp > highestTemp) highestTemp = temp;
      var dataPoint = {
  			x : Date.parse(data.message[i].receivedOn),
  			y : fahrenheitToCelsiusRaw(temp)
  		};
      tempTraces.push(dataPoint);
    }
    monnitSensors.temperature.dataPoints = tempTraces;
    drawAssetTemperatureChart();

    var sensor = monnitSensors.temperature;
    $("#asset-temperature-expanded-temperature").html(fahrenheitToCelsius(sensor.temperature));
    $("#asset-temperature-signal").html(sensor.signal + " %");
    $("#asset-temperature-rssi").html(sensor.rssi);
    if (data.message != undefined) {
      $("#asset-temperature-low").html(fahrenheitToCelsius(lowestTemp));
      $("#asset-temperature-high").html(fahrenheitToCelsius(highestTemp));
    } else {
      $("#asset-temperature-low").html(lowestTemp);
      $("#asset-temperature-high").html(highestTemp);
    }
    $("#asset-temperature-expanded-content").fadeIn();
  });
}
function drawAssetTemperatureChart() {
	$(".nvtooltip").remove(); //Hack to get around nvd3 tooltip bug
  var traces = [];
  traces.push({
    values	: monnitSensors.temperature.dataPoints,
    key			:	'Temperature',
    color		: '#d9534f'
  });
  nv.addGraph(function() {

    assetTemperatureChart = nv.models.lineChart()
                .useInteractiveGuideline(false)
                .showLegend(false)
                .showYAxis(true)
                .showXAxis(true);

    assetTemperatureChart.xAxis     //Chart x-axis settings
        .tickFormat(function(value) {
          var format = "%H:%M";
          return d3.time.format(format)(new Date(value));
        })
        .ticks(4)
        .tickPadding(10);
    assetTemperatureChart.yAxis     //Chart y-axis settings
          .tickFormat(d3.format('.1f'))
          .ticks(4);

   d3.select('svg#asset-temperature-chart')
     .datum(traces)
      .call(assetTemperatureChart);

    //Update the chart when window resizes.
    nv.utils.windowResize(function() { assetTemperatureChart.update() });
    return assetTemperatureChart;
  });
}
function updateAssetTemperatureExpansion() {
  var sensor = monnitSensors.temperature;
  var temp = sensor.temperature;
  $("#asset-temperature-expanded-temperature").html(fahrenheitToCelsius(temp));
  var dataPoint = {
    x : new Date(),
    y : fahrenheitToCelsiusRaw(temp)
  }
  sensor.dataPoints.unshift(dataPoint);
  assetTemperatureChart.update();
  $("#asset-temperature-signal").html(sensor.signal);
  $("#asset-temperature-rssi").html(sensor.rssi);
}
function temperatureCloseAssetExpansion() {
  $("#asset-temperature-expanded-content").hide();
  expandedView = "none";
}
/*
* Common functions
*/
function handleAssetMonnitMessage (sensorName) {
  switch (sensorName) {
    case "panTilt": updatePanTilt(); break;
    case "direction": updateDirection(); break;
    case "temperatureHumidity": updateHumidity(); break;
    case "temperature": updateTemperature(); break;
    case "asset" : updateAssetWidget(); break;
  }
}
function closeAssetExpanded(view) {
  var elementID = "#"  + "asset-" + view + "-expanded";
  $(elementID).animate({
    width: '1vw',
    height: '1vh'
  }, 200);
  expandedView = "none";
  $(elementID).fadeOut(100);

  switch (view) {
    case "pantilt"   : panTiltCloseAssetExpansion(); break;
    case "direction" : directionCloseAssetExpansion(); break;
    case "temperature" : temperatureCloseAssetExpansion(); break;
  }
}
function openAssetExpanded(view, vh, vw) {
  if (expandedView != "none") {
    closeAssetExpanded(expandedView);
  }
  var elementID = "#" + "asset-" + view + "-expanded";
  $(elementID).fadeIn();
  $(elementID).animate({
    width: vw + '%',
    height: vh + '%'
  }, 200);
  expandedView = view;

  switch (view) {
    case "pantilt"   : panTiltOpenAssetExpansion(); break;
    case "direction" : directionOpenAssetExpansion(); break;
    case "temperature" : temperatureAssetExpansion(); break;
    case "humidityTemperature" : humidityAssetExpansion(); break;
  }
}
