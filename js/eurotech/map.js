function getPositionData(cb) {
  var topic = ACCOUNT + "/+/Controller/position";
  $.ajax({
      url 			: REQ_URL_GET + "searchByTopic.json",
      data 			: {
        topic 	 : topic,
        limit 	 : 100
      },
      dataType		: "json",
      beforeSend 	: function(req) {
        req.setRequestHeader("Authorization", "Basic "
            + btoa(USERNAME + ":" + PASSWORD))
      }
    }).done(cb);
}
function initAssetMap(generatedMarkers) {
  var map;
  if (generatedMarkers.length == 0) {
    generatedMarkers.push(['Gateway',52.18936,0.13694]);
  }
  var markers = generatedMarkers;

  map = new google.maps.Map(document.getElementById('asset-map'), {
    mapTypeId: google.maps.MapTypeId.SATELLITE,
    zoom: 18
  });

  var assetTrackingRoute = [];
  for (var i in markers) {
    assetTrackingRoute.push({
      lat: markers[i][1],
      lng: markers[i][2]
    })
  }
  var trackingRoute = new google.maps.Polyline({
    path: assetTrackingRoute,
    geodesic: true,
    strokeColor: '#009fff',
    strokeOpacity: 0.6,
    strokeWeight: 9
  });
  trackingRoute.setMap(map);
  var bounds = new google.maps.LatLngBounds();


  // Loop through our array of markers & place each one on the map
  for( i = 0; i < markers.length; i++ ) {
    var position = new google.maps.LatLng(markers[i][1], markers[i][2]);
    bounds.extend(position);
    marker = new google.maps.Marker({
        position: position,
        map: map,
        title: markers[i][0]
    });
  }

  // Override our map zoom level once our fitBounds function runs (Make sure it only runs once)
  var boundsListener = google.maps.event.addListener((map), 'bounds_changed', function(event) {
      this.setZoom(16);
      google.maps.event.removeListener(boundsListener);
  });

  var center = new google.maps.LatLng(markers[0][1], markers[0][2]);
  map.setCenter(center);
}
function initAdminMap() {
  var markers = [
    ['Gateway', deviceInfo.gps.latitude, deviceInfo.gps.longitude],
  ];
  var map;
  map = new google.maps.Map(document.getElementById('admin-map'), {
    center: {lat: 52.35, lng: 0.3755},
    mapTypeId: google.maps.MapTypeId.SATELLITE,
    zoom: 18
  });
  var bounds = new google.maps.LatLngBounds();

  // Display multiple markers on a map
  var infoWindow = new google.maps.InfoWindow(), marker, i;

  // Loop through our array of markers & place each one on the map
  for( i = 0; i < markers.length; i++ ) {
    var position = new google.maps.LatLng(markers[i][1], markers[i][2]);
    bounds.extend(position);
    marker = new google.maps.Marker({
        position: position,
        map: map,
        title: markers[i][0]
    });

        // Automatically center the map fitting all markers on the screen
    map.fitBounds(bounds);
  }

  // Override our map zoom level once our fitBounds function runs (Make sure it only runs once)
  var boundsListener = google.maps.event.addListener((map), 'bounds_changed', function(event) {
      this.setZoom(16);
      google.maps.event.removeListener(boundsListener);
  });
}
