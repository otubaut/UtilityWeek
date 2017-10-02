
// For the asset sensor, how long before we consider it gone, having received no messages
var ASSET_TIMEOUT_MINS = 10;

var monnitSensors = {

  temperature : {
    topicName : "temperature",
    temperature : 0,
    signal: 0,
    rssi: 0,
    battery : 0,
    receivedOn : undefined,
    dataPoints: []
  },
  temperatureRTD : {
    topicName : "temperatureRTD",
    temperature : 0,
    signal: 0,
    rssi: 0,
    battery : 0,
    receivedOn : undefined,
    dataPoints: []
  },
  humidityTemperature : {
    topicName : "humidityTemperature",
    relativeHumidity : 0,
    signal : 0,
    rssi : 0,
    receivedOn : undefined,
    battery : 0
  },
  openClosed : {
    topicName : "openClosed",
    opened : false,
    signal : 0,
    rssi : 0,
    receivedOn : undefined,
    battery : 0,
    openDetects: []
  },
  lightPresence : {
    topicName : "lightPresence",
    lightOn : false,
    signal : 0,
    rssi : 0,
    receivedOn : undefined,
    battery : 0,
    lightDetects: []
  },
  water : {
    topicName : "water",
    waterPresent : false,
    signal : 0,
    rssi : 0,
    receivedOn : undefined,
    battery : 0,
    leakageDetects: []
  },
  currentTwenty : {
    topicName : "currentTwenty",
    MaxCurrent : 0,
    AmpHours : 0,
    signal: 0,
    rssi: 0,
    battery : 0,
    receivedOn : undefined,
    dataPoints: []
  },
  currentOneFifty : {
    topicName : "currentOneFifty",
    MaxCurrent : 0,
    signal: 0,
    rssi: 0,
    battery : 0,
    receivedOn : undefined,
    dataPoints: []
  },


};

function updateAllSensors() {
  for (var i in monnitSensors) {
    var sensorName = i;
    try {
      updateSensor(sensorName);
    } catch (e) {
      continue;
    }
  }
}

function updateSensor (sensorName) {
  getMonnitSensorStatus(sensorName, function(data) {
    if (data.message == undefined) {
      return;
    }
    var receivedOn = data.message[0].receivedOn;

    if (receivedOn != monnitSensors[sensorName].receivedOn) {
      var metrics = getMetrics(data.message[0].payload.metrics.metric);
      updateSensorProperties(sensorName, metrics, receivedOn);

      switch (activeView) {
        case "facility" : handleFacilityMonnitMessage(sensorName); break;
        case "asset" : handleAssetMonnitMessage (sensorName); break;
        case "overview" : handleOverviewMonnitMQTTMessage(sensorName); break;
        }
    }
  });
}

function updateSensorProperties(sensorName, metrics, receivedOn) {
  monnitSensors[sensorName].signal = metrics.signal;
  monnitSensors[sensorName].rssi= metrics.fieldRSSI;
  monnitSensors[sensorName].receivedOn = receivedOn;
  monnitSensors[sensorName].battery = metrics.battery;
  switch (sensorName) {
    case "temperatureRTD" :
      monnitSensors[sensorName].temperature = metrics.temperature;
    case "temperature" :
      monnitSensors[sensorName].temperature = metrics.temperature;
      break;
    case "humidityTemperature" :
      monnitSensors[sensorName].relativeHumidity = metrics.relativeHumidity;
      break;
    case "openClosed" :
      monnitSensors[sensorName].opened = metrics.opened;
      break;
    case "lightPresence" :
      monnitSensors[sensorName].lightOn = metrics.lightOn;
      break;
    case "water" :
      monnitSensors[sensorName].waterPresent = metrics.waterPresent;
      break;
    case "currentTwenty" :
        monnitSensors[sensorName].MaxCurrent = metrics.MaxCurrent;
        monnitSensors[sensorName].battery = metrics.battery;
      break;
    case "currentOneFifty" :
        monnitSensors[sensorName].MaxCurrent = metrics.MaxCurrent;
      break;
  }
}

function getMonnitSensorStatus (sensor, cb) {
  var topic = ACCOUNT + "/+/monnit/" + sensor + "/#";
  $.ajax({
      url 			: REQ_URL_GET + "searchByTopic.json",
      data 			: {
        topic 	 : topic,
        limit 	 : 1
      },
      dataType		: "json",
      beforeSend 	: function(req) {
        req.setRequestHeader("Authorization", "Basic "
            + btoa(USERNAME + ":" + PASSWORD))
      }
    }).done(cb);
}
function getMonnitSensorHistory (sensor, startDate, endDate, cb) {
  var topic = ACCOUNT + "/+/monnit/" + sensor + "/#";
  $.ajax({
      url 			: REQ_URL_GET + "searchByTopic.json",
      data 			: {
        topic 	   : topic,
        limit 	   : 10000,
        startDate  : startDate,
        endDate    : endDate
      },
      dataType		: "json",
      beforeSend 	: function(req) {
        req.setRequestHeader("Authorization", "Basic "
            + btoa(USERNAME + ":" + PASSWORD))
      }
    }).done(cb);
}
function handleMonnitMQTTMessage(sensorName, payload) {
  updateSensorProperties(sensorName, payload, moment.utc());
  switch (activeView) {
    case "facility" : handleFacilityMonnitMessage(sensorName); break;
    case "asset" : handleAssetMonnitMessage(sensorName); break;
    case "overview" : handleOverviewMonnitMQTTMessage(sensorName); break;
  }
}
function checkAssetSensor(){
  if (monnitSensors.asset.lastReceived == undefined) {
    return false;
  }
  var now = moment().utc();
  var lastReceived = moment(monnitSensors.asset.lastReceived);
  return (now.diff(lastReceived, 'minutes') < ASSET_TIMEOUT_MINS);
}
