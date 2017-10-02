var overviewSparkline;

function initOverviewWidgets() {
  updateAllSensors();

  //Wait for updates to complete.
  setTimeout(function(){

    for (var sensorName in monnitSensors) {
      updateOverviewMonnitWidget(sensorName);
    }
  }, 2000);

}
function updateOverviewMonnitWidget(sensorName) {
  var sensor = monnitSensors[sensorName];
  $("#overview-" + sensorName + "-rssi").html(sensor.rssi);
  $("#overview-" + sensorName + "-signal").html(sensor.signal);

  var specificDataField = $("#overview-" + sensorName + "-specific");
  switch (sensorName) {
    case "temperatureRTD" :
      specificDataField.html(fahrenheitToCelsius(sensor.temperature));
      break;
    case "temperature" :
      specificDataField.html(fahrenheitToCelsius(sensor.temperature));
      break;
    case "humidityTemperature" :
      specificDataField.html(sensor.relativeHumidity.toFixed(1) + "%");
      break;
    case "openClosed" :
      if (sensor.opened) {
        var html = '<span class="glyphicon glyphicon-exclamation-sign text-danger"></span>&nbspOpened!'
      } else {
        var html = '<span class="glyphicon glyphicon-ok text-success"></span>&nbspClosed'
      }
      specificDataField.html(html);
      break;
    case "lightPresence" :
      if (sensor.lightOn) {
        var html = '<span class="glyphicon glyphicon-exclamation-sign text-danger"></span>&nbspDetected!'
      } else {
        var html = '<span class="glyphicon glyphicon-ok text-success"></span>&nbspNot Detected'
      }
      specificDataField.html(html);
      break;
    case "water" :
      if (sensor.waterPresent) {
        var html = '<span class="glyphicon glyphicon-exclamation-sign text-danger"></span>&nbspDetected!'
      } else {
        var html = '<span class="glyphicon glyphicon-ok text-success"></span>&nbspNot Detected'
      }
      specificDataField.html(html);
      break;
    case "currentTwenty" :
        specificDataField.html(sensor.MaxCurrent.toFixed(2) + " Amp");
        break;

    case "currentOneFifty" :
        specificDataField.html(sensor.MaxCurrent.toFixed(1) + " Amp");
        break;

  }
  var specificaverageField = $("#overview-" + sensorName + "-average");
  switch (sensorName) {
    case "currentTwenty" :
    specificaverageField.html(sensor.battery.toFixed(2) + " %");
    break;
}
}
function handleOverviewMonnitMQTTMessage(sensorName) {
  updateOverviewMonnitWidget(sensorName);
}
