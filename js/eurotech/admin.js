var accountInfo = {
  name : "Unknown",
  organization: "Unknown",
  email : "Unknown"
}
var deviceInfo = {
  clientID : "Unknown",
  name : "Unknown",
  model: "Unknown",
  serialNumber : "Unknown",
  gps : {
    latitude: 0,
    longitude: 0,
    altitude: 0
  },
  connectionStatus : "Unknown",
  lastEvent : "Unknown",
  eventDate : new Date()
}

function getAccountInfo() {
  $.ajax({
      url 			: REQ_URL_GET_ACCOUNTS,
      dataType		: "json",
      beforeSend 	: function(req) {
        req.setRequestHeader("Authorization", "Basic "
            + btoa(USERNAME + ":" + PASSWORD))
      }
    }).done(function(data){
      var account = data.account[0];

      if (account == undefined) {
        return;
      } else {
        accountInfo.name = account.name;
        accountInfo.organization = account.organization.name;
        accountInfo.email = account.organization.email;
      }
    });
}

function getDeviceInfo() {
  $.ajax({
      url 			: REQ_URL_GET_DEVICES,
      data      : {
        fetch : "FULL"
      },
      dataType		: "json",
      beforeSend 	: function(req) {
        req.setRequestHeader("Authorization", "Basic "
            + btoa(USERNAME + ":" + PASSWORD))
      }
    }).done(function(data) {
      if (data.device == undefined) {
        return;
      }
      //WE are looking for display name "Demo Box 10-20"
      for (var i in data.device) {
        var device = data.device[i];
        // Sort of hackish. We only want the actual device. Note- changed due to IE not supporting .includes method
        if (device.displayName != "Demo Box 10-20") {
          continue;
        }
        deviceInfo.clientID = device.clientId;
        deviceInfo.name = device.displayName;
        deviceInfo.model = device.modelId;
        deviceInfo.serialNumber = device.serialNumber;
        deviceInfo.connectionStatus = device.connectionStatus;

        // Default to cambridge office if no GPS location on
        if (device.gpsLatitude == 0 && device.gpsLongitude == 0) {
          device.gpsLatitude = 52.1895606;
          device.gpsLongitude = 0.1360954;
        }
        deviceInfo.gps.latitude = device.gpsLatitude;
        deviceInfo.gps.longitude = device.gpsLongitude;
        deviceInfo.gps.altitude = device.gpsAltitude;
        deviceInfo.lastEvent = device.lastEventType;
        deviceInfo.eventDate = new Date(device.lastEventOn);
      }
    });
}

function updateAccountInfoWidget() {
  $("#admin-account-name").html(accountInfo.name);
  $("#admin-organization-name").html(accountInfo.organization);
  $("#admin-poc-email").html(accountInfo.email);
}

function updateDeviceInfoWidget() {
  $("#device-client-id").html(deviceInfo.clientID);
  $("#device-name").html(deviceInfo.name);
  $("#device-model").html(deviceInfo.model);
  $("#device-serial-number").html(deviceInfo.serialNumber);
}

function updateConnectionWidget() {
  var glyphicon;
  var text;
  var cssClass;

  switch (deviceInfo.connectionStatus) {
    case "CONNECTED" :
      glyphicon = "glyphicon glyphicon-ok-sign";
      text = "Connected";
      cssClass = "text-success";
      break;
    case "DISCONNECTED" :
      glyphicon = "glyphicon glyphicon-remove-sign";
      text = "Disconnected";
      cssClass = "text-danger";
      break;
    case "MISSING" :
      glyphicon = "glyphicon glyphicon-warning-sign";
      text = "Missing";
      cssClass = "text-warning";
      break;
  }

  var html = '<span class="' + glyphicon + ' ' + cssClass + '"></span>&nbsp&nbsp' + text;
  $("#device-connection-status").html(html);

  $("#device-last-event").html(deviceInfo.lastEvent);
  $("#device-last-event-date").html(moment(deviceInfo.eventDate).format('MMMM Do YYYY, h:mm:ss a'));
}
function initAdminWidgets() {
  updateAccountInfoWidget();
  updateDeviceInfoWidget();
  updateConnectionWidget();
}
