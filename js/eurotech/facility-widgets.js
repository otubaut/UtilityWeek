/*
 * Global variables
 */
var facilityTemperatureChart;
var expandedView = "none";

//function containsSwipeAlert()

function createFacilitySwipeAlert(message) {
  var id = message.replace(/\s+/g, '');
  if ($("#facility-warnings").children().length < 8) {
    $("#facility-warnings").append(
      '<div class="warning-message" id="' + id +  '"><span class="glyphicon glyphicon-exclamation-sign text-danger pull-left"></span>'
      + '<span class="pull-left">&nbsp<small>' + moment().format('M/D/YYYY h:mm:ss a') + '</small></span>&nbsp' + message + '</div>'
    );
  }
}

/*
 * Open/close door functions
 */
function animateOpenCloseDoor(opened) {
  var doorHeight;
  if (opened) {
    doorHeight = "15%"
  } else {
    doorHeight = "100%"
  }
  var door = $("#facility-open-close-door");
  door.animate({ height: doorHeight }, 600);
}
function controlDoorSensor(opened) {
  if (opened) {
    animateOpenCloseDoor(true);
    setTimeout(function() {
      var alert = $("#facility-open-close-alert");
      alert.fadeIn().delay(300).fadeOut(1000).fadeIn("fast").delay(300).fadeOut(1000).fadeIn("fast");
    }, 1000);
  } else {
    animateOpenCloseDoor(false);
    setTimeout(function() {
      $("#facility-open-close-alert").hide();
    }, 1000);
  }
}
function openClosedCloseFacilityExpansion() {
  $("#facility-openClosed-expanded-content").hide();
  expandedView = "none";
}
function openClosedExpansion (startDate, endDate) {
  //Since each expanded view is bespoke, their minimum sizes need to be specific.
  var elementID = "#"  + "facility-" + expandedView + "-expanded";
  $(elementID).css({'min-height': '35%'});

  // Default to past hour.
  if (startDate == undefined) {
    var startDate = moment().subtract(24, 'hours').unix() * 1000;
    var endDate = moment().unix() * 1000;
  }

  getMonnitSensorHistory ("openClosed", startDate, endDate, function(data){
    var openDetects = [];
    for (var i in data.message) {
      var metrics = getMetrics(data.message[i].payload.metrics.metric);
      if (metrics.opened) {
        openDetects.push ({
          date : new Date(Date.parse(data.message[i].receivedOn))
        });
      }
    }
    monnitSensors.openClosed.openDetects = openDetects;
    if (openDetects.length == 0) {
      $("#facility-openClosed-expanded-table").html(
        '<span class="expanded-content-h2">'
        + '<span class="glyphicon glyphicon-ok text-success"></span>'
        + '&nbspNo intrusions detected in 24 hours!</span>'
      );
    } else {
      $("#facility-openClosed-expanded-table").html(buildFacilityOpenCloseTable(openDetects));
    }
    var sensor = monnitSensors.openClosed;
    $("#facility-openClosed-expanded-content").fadeIn();
    $("#facility-openClosed-signal").html(sensor.signal + "%");
    $("#facility-openClosed-rssi").html(sensor.rssi);
  });
}
function buildFacilityOpenCloseTable(openDetects){
  var glyphiconIndicator = '<span class="glyphicon glyphicon-exclamation-sign text-danger"></span>'
  var tableHeader = '<table class="table table-condensed expanded-content-table">';
  var tableClosure = '</table>';
  var tableContent = "";
  var maxEntries = (openDetects.length >  4) ?  4 : openDetects.length;
  for (var i = 0; i < maxEntries; i++) {
    tableContent = tableContent + '<tr><td>' + glyphiconIndicator + '&nbspDoor opened</td>';
    tableContent = tableContent + '<td>' + moment(openDetects[i].date).format('dddd, MMMM Do YYYY, h:mm:ss a') + '</td></tr>';
  }
  return (tableHeader + tableContent + tableClosure);
}
function updateFacilityOpenClosedExpansion() {

}

/*
 * Asset sensor functions
 */
function controlAssetSensor() {
  var present = checkAssetSensor();
  if (present) {
    $("#facility-asset-barrel").show();
    $("#facility-asset-alert-message").html(
      '<span class="glyphicon glyphicon-ok text-success"></span>'
      + '&nbspAsset Detected'
    );
    $("#facility-asset-alert").show();
  } else {
    $("#facility-asset-barrel").fadeOut("slow");
    setTimeout(function() {
      var alert = $("#facility-asset-alert");
      alert.fadeOut();
      $("#facility-asset-alert-message").html(
        '<span class="glyphicon glyphicon-exclamation-sign text-danger"></span>'
        + '&nbspAsset Missing!'
      );
      alert.fadeIn().delay(300).fadeOut(1000).fadeIn("fast").delay(300).fadeOut(1000).fadeIn("fast");
    }, 1000);
  }
}
function updateFacilityAssetExpansion(){
  $("#facility-asset-signal").html(sensor.signal + "%");
  $("#facility-asset-rssi").html(sensor.rssi);
}
function assetExpansion() {
  var sensor = monnitSensors.asset;
  $("#facility-asset-expanded-content").fadeIn();
  $("#facility-asset-signal").html(sensor.signal + "%");
  $("#facility-asset-rssi").html(sensor.rssi);
}
function assetCloseFacilityExpansion()  {
  $("#facility-asset-expanded-content").hide();
  expandedView = "none";
}
/*
 * Water rope sensor functions.
 */
function controlWaterSensor(waterDetected) {
  if (waterDetected) {
    var alert = $("#facility-water-alert");
    alert.fadeOut();
    $("#facility-water-alert-message").html (
      '<span class="glyphicon glyphicon-exclamation-sign text-danger"></span>'
      + '&nbspWater Leak Detected!'
    );
    alert.fadeIn().delay(300).fadeOut(1000).fadeIn("fast").delay(300).fadeOut(1000).fadeIn("fast");
  } else {
    $("#facility-water-alert-message").html(
      '<span class="glyphicon glyphicon-ok text-success"></span>'
      + '&nbspNo Leak Detected'
    );
    $("#facility-water-alert").show();
  }
}
//Do expansion stuff
function waterExpansion (startDate, endDate) {
  //Since each expanded view is bespoke, their minimum sizes need to be specific.
  var elementID = "#"  + "facility-" + expandedView + "-expanded";
  $(elementID).css({'min-height': '30%'});

  // Default to past hour.
  if (startDate == undefined) {
    var startDate = moment().subtract(24, 'hours').unix() * 1000;
    var endDate = moment().unix() * 1000;
  }

  getMonnitSensorHistory ("water", startDate, endDate, function(data){
    var leakageDetects = [];
    for (var i in data.message) {
      var metrics = getMetrics(data.message[i].payload.metrics.metric);
      if (metrics.waterPresent) {
        leakageDetects.push ({
          date : new Date(Date.parse(data.message[i].receivedOn))
        });
      }
    }
    monnitSensors.water.leakageDetects = leakageDetects;
    if (leakageDetects.length == 0) {
      $("#facility-water-expanded-table").html(
        '<span class="expanded-content-h2">'
        + '<span class="glyphicon glyphicon-ok text-success"></span>'
        + '&nbspNo leak detected in past 24 hours!</span>'
      );
    } else {
      $("#facility-water-expanded-table").html(buildFacilityWaterLeakageTable(leakageDetects));
    }
    var sensor = monnitSensors.water;
    $("#facility-water-expanded-content").fadeIn();
    $("#facility-water-signal").html(sensor.signal + "%");
    $("#facility-water-rssi").html(sensor.rssi);
    drawWaterLeak(sensor.waterPresent);
    $(window).bind("resize", waterResizeHandler);
  });
}
function buildFacilityWaterLeakageTable(leakageDetects){
  var glyphiconIndicator = '<span class="glyphicon glyphicon-exclamation-sign text-danger"></span>'
  var tableHeader = '<table class="table table-condensed expanded-content-table">';
  var tableClosure = '</table>';
  var tableContent = "";
  var maxEntries = (leakageDetects.length >  4) ?  4 : leakageDetects.length;
  for (var i = 0; i < maxEntries; i++) {
    tableContent = tableContent + '<tr><td>' + glyphiconIndicator + '&nbspWater leak detected</td>';
    tableContent = tableContent + '<td>' + moment(leakageDetects[i].date).format('dddd, MMMM Do YYYY, h:mm:ss a') + '</td></tr>';
  }
  return (tableHeader + tableContent + tableClosure);
}
function updateFacilityWaterExpansion() {
  var sensor = monnitSensors.water;
  drawWaterLeak(sensor.waterPresent);
  if (sensor.waterPresent) {
    sensor.leakageDetects.unshift(new Date());
  }
  $("#facility-water-signal").html(sensor.signal);
  $("#facility-water-rssi").html(sensor.rssi);
  if (sensor.leakageDetects.length == 0) {
    $("#facility-water-expanded-table").html(
      '<span class="expanded-content-h2">'
      + '<span class="glyphicon glyphicon-ok text-success"></span>'
      + '&nbspNo leak detected in past 24 hours!</span>'
    );
  } else {
    $("#facility-water-expanded-table").html(buildFacilityWaterLeakageTable(leakageDetects));
  }
}
var waterResizeHandler = function() {
  $("#facility-water-leak").html("");
  drawWaterLeak(monnitSensors.water.waterPresent);
};
function drawWaterLeak(waterLeak) {
  if (waterLeak) {
    var width = document.documentElement.clientWidth * 0.8;
    var leak = document.getElementById("facility-water-leak"),
      waveWidth = 10,
      waveCount = Math.floor(width/waveWidth) + 1,
      docFrag = document.createDocumentFragment();
    for (var i = 0; i < waveCount; i++){
      var wave = document.createElement("div");
      wave.className += " wave-anim";
      wave.style.left = i * waveWidth + "px";
      wave.style.webkitAnimationDelay = (i/97) + "s";
      docFrag.appendChild(wave);
    }
    leak.appendChild(docFrag);

  } else {
    $("#facility-water-leak").html("");
  }
}
//Close expansion stuff. and do cleanup
function waterCloseFacilityExpansion() {
  $("#facility-water-expanded-content").hide();
  expandedView = "none";
  $("#facility-water-leak").html("");
  $(window).unbind("resize", waterResizeHandler);
}

/*
 * Light sensor functions.
 */
function controlLightSensor(lightOn) {
  if (lightOn) {
    $("#facility-light-ongraphic").fadeIn("fast");
  } else {
    $("#facility-light-ongraphic").fadeOut("fast");
  }
}
function lightPresenceCloseFacilityExpansion() {
  $("#facility-lightPresence-expanded-content").hide();
  $("#facility-expanded-lightbulb").html("");
  expandedView = "none";
}
function lightPresenceExpansion (startDate, endDate) {
  //Since each expanded view is bespoke, their minimum sizes need to be specific.
  var elementID = "#"  + "facility-" + expandedView + "-expanded";
  $(elementID).css({'min-height': '35%'});

  // Default to past hour.
  if (startDate == undefined) {
    var startDate = moment().subtract(24, 'hours').unix() * 1000;
    var endDate = moment().unix() * 1000;
  }

  getMonnitSensorHistory ("lightPresence", startDate, endDate, function(data){
    var lightDetects = [];
    for (var i in data.message) {
      var metrics = getMetrics(data.message[i].payload.metrics.metric);
      if (metrics.lightOn) {
        lightDetects.push ({
          date : new Date(Date.parse(data.message[i].receivedOn))
        });
      }
    }
    monnitSensors.lightPresence.lightDetects = lightDetects;
    if (lightDetects.length == 0) {
      $("#facility-lightPresence-expanded-table").html(
        '<span class="expanded-content-h2">'
        + '<span class="glyphicon glyphicon-ok text-success"></span>'
        + '&nbspNo light presence detected in 24 hours!</span>'
      );
    } else {
      $("#facility-lightPresence-expanded-table").html(buildFacilityLightTable(lightDetects));
    }
    var sensor = monnitSensors.lightPresence;
    $("#facility-lightPresence-expanded-content").fadeIn();
    $("#facility-lightPresence-signal").html(sensor.signal + "%");
    $("#facility-lightPresence-rssi").html(sensor.rssi);
    var lightBulb = new steelseries.LightBulb('facility-expanded-lightbulb',{});
    lightBulb.setOn(sensor.lightOn);
  });
}
function buildFacilityLightTable(lightDetects){
  var glyphiconIndicator = '<span class="glyphicon glyphicon-exclamation-sign text-danger"></span>'
  var tableHeader = '<table class="table table-condensed expanded-content-table">';
  var tableClosure = '</table>';
  var tableContent = "";
  var maxEntries = (lightDetects.length >  4) ?  4 : lightDetects.length;
  for (var i = 0; i < maxEntries; i++) {
    tableContent = tableContent + '<tr><td>' + glyphiconIndicator + '&nbspLight detected</td>';
    tableContent = tableContent + '<td>' + moment(lightDetects[i].date).format('dddd, MMMM Do YYYY, h:mm:ss a') + '</td></tr>';
  }
  return (tableHeader + tableContent + tableClosure);
}
function updateFacilityLightPresenceExpansion() {
  var sensor = monnitSensors.lightPresence;
  sensor.lightDetects.unshift(new Date());
  $("#facility-lightPresence-signal").html(sensor.signal);
  $("#facility-lightPresence-rssi").html(sensor.rssi);
  if (sensor.lightDetects.length == 0) {
    $("#facility-lightPresence-expanded-table").html(
      '<span class="expanded-content-h2">'
      + '<span class="glyphicon glyphicon-ok text-success"></span>'
      + '&nbspNo lights detected in 24 hours!</span>'
    );
  } else {
    $("#facility-lightPresence-expanded-table").html(buildFacilityLightTable(sensor.lightDetects));
  }
  var lightBulb = new steelseries.LightBulb('facility-expanded-lightbulb',{});
  lightBulb.setOn(sensor.lightOn);
}

/*
 * Temperature sensor functions.
 */
function controlTemperatureSensor(temp) {
  var temperature = fahrenheitToCelsius(temp);
  $("#facility-temp-reading-text").html(temperature);
}
//Do expansion stuff
function temperatureExpansion (startDate, endDate) {
  //Since each expanded view is bespoke, their minimum sizes need to be specific.
  var elementID = "#"  + "facility-" + expandedView + "-expanded";
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
    drawFacilityTemperatureChart();

    var sensor = monnitSensors.temperature;
    $("#facility-temperature-expanded-temperature").html(fahrenheitToCelsius(sensor.temperature));
    $("#facility-temperature-signal").html(sensor.signal + " %");
    $("#facility-temperature-rssi").html(sensor.rssi);
    if (data.message != undefined) {
      $("#facility-temperature-low").html(fahrenheitToCelsius(lowestTemp));
      $("#facility-temperature-high").html(fahrenheitToCelsius(highestTemp));
    } else {
      $("#facility-temperature-low").html(lowestTemp);
      $("#facility-temperature-high").html(highestTemp);
    }
    $("#facility-temperature-expanded-content").fadeIn();
  });

}
//Close expansion stuff. and do cleanup
function drawFacilityTemperatureChart() {
	$(".nvtooltip").remove(); //Hack to get around nvd3 tooltip bug
  var traces = [];
  traces.push({
    values	: monnitSensors.temperature.dataPoints,
    key			:	'Temperature',
    color		: '#d9534f'
  });
  nv.addGraph(function() {

    facilityTemperatureChart = nv.models.lineChart()
                .useInteractiveGuideline(false)
                .showLegend(false)
                .showYAxis(true)
                .showXAxis(true);

    facilityTemperatureChart.xAxis     //Chart x-axis settings
        .tickFormat(function(value) {
          var format = "%H:%M";
          return d3.time.format(format)(new Date(value));
        })
        .ticks(4)
        .tickPadding(10);
    facilityTemperatureChart.yAxis     //Chart y-axis settings
          .tickFormat(d3.format('.1f'))
          .ticks(4);

   d3.select('svg#facility-temperature-chart')
     .datum(traces)
      .call(facilityTemperatureChart);

    //Update the chart when window resizes.
    nv.utils.windowResize(function() { facilityTemperatureChart.update() });
    return facilityTemperatureChart;
  });
}
function updateFacilityTemperatureExpansion() {
  var sensor = monnitSensors.temperature;
  var temp = sensor.temperature;
  $("#facility-temperature-expanded-temperature").html(fahrenheitToCelsius(temp));
  var dataPoint = {
    x : new Date(),
    y : fahrenheitToCelsiusRaw(temp)
  }
  sensor.dataPoints.unshift(dataPoint);
  facilityTemperatureChart.update();
  $("#facility-temperature-signal").html(sensor.signal);
  $("#facility-temperature-rssi").html(sensor.rssi);
}
function temperatureCloseFacilityExpansion() {
  $("#facility-temperature-expanded-content").hide();
  expandedView = "none";
}

/*
 * Common functions
 */
 function handleFacilityMonnitMessage(sensorName) {

   switch (sensorName) {
     case "temperature":
       var temp = monnitSensors.temperature.temperature;
       $("#facility-temp-reading-text").html(fahrenheitToCelsius(temp));
       if (expandedView == "temperature") {
         updateFacilityTemperatureExpansion();
       }
       break;

    case "openClosed":
      var status = monnitSensors.openClosed.opened;
      controlDoorSensor(status);
      if (expandedView == "openClosed"){
        updateFacilityOpenClosedExpansion();
      }
      if (status) {
        createFacilitySwipeAlert("Door opened");
      }
      break;

    case "water":
      var status = monnitSensors.water.waterPresent;
      controlWaterSensor(status);
      if (expandedView == "water") {
        updateFacilityWaterExpansion();
      }
      if (status) {
        createFacilitySwipeAlert("Water detected");
      }
      break;

    case "lightPresence":
      var status = monnitSensors.lightPresence.lightOn;
      controlLightSensor(status);
      if (expandedView == "lightPresence") {
        updateFacilityLightPresenceExpansion();
      }
      if (status){
        createFacilitySwipeAlert("Light detected");
      }
      break;

   case "asset":
     var status = checkAssetSensor();
     controlAssetSensor();
     if (expandedView == "asset") {
       updateFacilityAssetExpansion();
     }
     if (!status){
       createFacilitySwipeAlert("Asset missing");
     }
  }
 }
 function closeFacilityExpanded(view) {
   var elementID = "#"  + "facility-" + view + "-expanded";
   $(elementID).animate({
     width: '1vw',
     height: '1vh'
   }, 200);
   expandedView = "none";
   $(elementID).fadeOut(100);

   switch (view) {
     case "temperature" : temperatureCloseFacilityExpansion(); break;
     case "water" : waterCloseFacilityExpansion(); break;
     case "light" : lightPresenceCloseFacilityExpansion(); break;
     case "asset" : assetCloseFacilityExpansion(); break;
     case "openClosed" : openClosedCloseFacilityExpansion(); break;
   }
 }
 function showFacilityExpanded(view, vh, vw) {
   if (expandedView != "none") {
     closeFacilityExpanded(expandedView);
   }
   var elementID = "#" + "facility-" + view + "-expanded";
   $(elementID).fadeIn();
   $(elementID).animate({
     width: vw + '%',
     height: vh + '%'
   }, 200);
   expandedView = view;

   switch (view) {
     case "temperature" : temperatureExpansion(); break;
     case "water" : waterExpansion(); break;
     case "lightPresence" : lightPresenceExpansion(); break;
     case "asset" : assetExpansion(); break;
     case "openClosed" : openClosedExpansion(); break;
   }
 }

/*
 * Called once when facility view is enabled.
 */
function initFacilityWidgets(){
  setTimeout(function(){
    showFacilityWidgets();
    initInitialSensorReadings();
  }, 500);
}
function showFacilityWidgets() {
  $("#facility-open-close-sensor").show();
  $("#facility-temp-sensor").show();
  $("#facility-asset-sensor").show();
  $("#facility-light-sensor").show();
  $("#facility-water-sensor").show();

  $("#facility-warnings").empty();
  $("#facility-warnings").show();
  $("#facility-temp-reading").show();
  $("#facility-open-close-canvas").show();
}
function initInitialSensorReadings () {
  controlTemperatureSensor(monnitSensors.temperature.temperature);
  controlLightSensor(monnitSensors.lightPresence.lightOn);
  controlWaterSensor(monnitSensors.water.waterPresent);
  controlDoorSensor(monnitSensors.openClosed.opened);
  controlAssetSensor();
}
