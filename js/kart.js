proj4.defs('EPSG:32633','+proj=utm +zone=33 +ellps=WGS84 +datum=WGS84 +units=m +no_defs');
proj4.defs('EPSG:3857', '+proj=merc +lon_0=0 +k=1 +x_0=0 +y_0=0 +a=6378137 +b=6378137 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs');
var epsg3857 = proj4('EPSG:3857');
var epsg32633 = proj4('EPSG:32633');

var map;
var geocoder;
var marker;

function initializeMap() {
  geocoder = new google.maps.Geocoder();
  var oslo = new google.maps.LatLng(59.91387, 10.75225);
  var mapOptions = {
    zoom: 6,
    center: oslo,
    rotateControl: true,
    scaleControl: true,
    panControl : false,
    mapTypeId: 'mix',
    mapTypeControl: true,
    tilt: 45,
    mapTypeControlOptions: {
      mapTypeIds: [google.maps.MapTypeId.ROADMAP, google.maps.MapTypeId.HYBRID, 'statkart_topo2', 'statkart_raster', 'eniro_aerial', 'mix'],
      style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR
    }
  };
  map = new google.maps.Map(document.getElementById('map-canvas'),
      mapOptions);

  function createMapType(inType, layer, name) {
	return new google.maps.ImageMapType({
    getTileUrl: function(coord, zoom) {
      var l = layer;
      var type = inType;
      if (inType == 'mix') {
	      if (zoom < 9) {
		type = 'google';
	      } else {
		type = 'sk'
	      }
	      if (zoom > 12) {
		l = 'toporaster3';
	      }
      }
      if (type == 'sk') {
    	  return 'http://opencache.statkart.no/gatekeeper/gk/gk.open_gmaps?layers=' + l + '&zoom=' + zoom + '&x=' + coord.x + '&y=' + coord.y;
      } else if (type == 'eniro') {
		var y = coord.y;
		var y = Math.pow(2, zoom) - y - 1;
		return 'http://map01.eniro.no/geowebcache/service/tms1.0.0/aerial/' + zoom + '/' + coord.x + '/' + y + '.jpeg';
      } else if (type == 'google') {
    	return 'http://mt0.google.com/vt/v=w2p.106&hl=en&x=' + coord.x+ '&y=' + coord.y + '&z=' + zoom;
      } 
    },
    tileSize: new google.maps.Size(256, 256), 
    opacity :1,
    isPng: true,
    minZoom: 5,
    maxZoom: 20,
    name: name
  });

  }
  map.mapTypes.set('mix', createMapType('mix', 'topo2', 'Miks av basiskart'));
  map.mapTypes.set('statkart_topo2', createMapType('sk', 'topo2', 'Statkart topograkrafisk'));
  map.mapTypes.set('statkart_raster', createMapType('sk', 'toporaster3', 'Statkart Raster'));
  map.mapTypes.set('eniro_aerial', createMapType('eniro', 'aearial', 'Eniro Flyfoto'));


  var input = /** @type {HTMLInputElement} */(
      document.getElementById('pac-input'));


  var searchBox = new google.maps.places.SearchBox(
    /** @type {HTMLInputElement} */(input));	
  input.index=1;
  map.controls[google.maps.ControlPosition.LEFT_TOP].push(input);

  var controlPanelDiv = document.createElement('div');
  controlPanelDiv.id = 'controlPanel';
  var controlPanel = new ControlPanel(controlPanelDiv, map);

  controlPanelDiv.index = 3;
  map.controls[google.maps.ControlPosition.LEFT_TOP].push(controlPanelDiv);

  var div = document.createElement('div');
  div.id ='contentInfo';
  div.index = 2;
  map.controls[google.maps.ControlPosition.LEFT_TOP].push(div);

  var norgeskartBounds = new google.maps.LatLngBounds(new google.maps.LatLng(
			57.5, 3), new google.maps.LatLng(71, 31.5));

  google.maps.event.addListener(map, 'maptypeid_changed', function() {
	if (map.getMapTypeId() == 'statkart_topo2' || map.getMapTypeId() == 'statkart_raster' ) {
		if (!norgeskartBounds.contains(map.getBounds().getCenter())) {
			map.panToBounds(norgeskartBounds);
			map.setZoom(5);
			return;
		}

	}
  });

google.maps.event.addListener(map, 'click', function(event) {
setOnclickMarker(event.latLng);
onClickMap(event.latLng);
});

function setOnclickMarker(latLng) {
if (!marker) {
marker = new google.maps.Marker({
    map: map,
    draggable: false,
    position: latLng
  });
} else {
marker.setPosition(latLng);
}

}

var markers = [];
google.maps.event.addListener(map, 'bounds_changed', function() {
    var bounds = map.getBounds();
    searchBox.setBounds(bounds);
  });
google.maps.event.addListener(searchBox, 'places_changed', function() {
    var places = searchBox.getPlaces();

    if (places.length == 0) {
      return;
    }
    for (var i = 0, marker; marker = markers[i]; i++) {
      marker.setMap(null);
    }
    if (places.length == 1) {
	map.setCenter(places[0].geometry.location);
        map.setZoom(12);
	setOnclickMarker(places[0].geometry.location);
	onClickMap(places[0].geometry.location, places[0].name);
        return;
    }
    // For each place, get the icon, place name, and location.
    markers = [];
    var bounds = new google.maps.LatLngBounds();
    for (var i = 0, place; place = places[i]; i++) {
      var image = {
        url: place.icon,
        size: new google.maps.Size(71, 71),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(17, 34),
        scaledSize: new google.maps.Size(25, 25)
      };

      // Create a marker for each place.
      marker = new google.maps.Marker({
        map: map,
        icon: image,
        title: place.name,
	clickable: true,
        position: place.geometry.location
      });
google.maps.event.addListener(marker, 'click', function() {
});

      markers.push(marker);

      bounds.extend(place.geometry.location);
    }
    map.fitBounds(bounds);
    
  });

}



