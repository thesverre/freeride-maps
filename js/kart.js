proj4.defs('EPSG:32633','+proj=utm +zone=33 +ellps=WGS84 +datum=WGS84 +units=m +no_defs');
proj4.defs('EPSG:3857', '+proj=merc +lon_0=0 +k=1 +x_0=0 +y_0=0 +a=6378137 +b=6378137 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs');
var epsg3857 = proj4('EPSG:3857');
var epsg32633 = proj4('EPSG:32633');

var map;
var geocoder;

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

	

  var controlPanelDiv = document.createElement('div');
  var controlPanel = new ControlPanel(controlPanelDiv, map);

  controlPanelDiv.index = 1;
  map.controls[google.maps.ControlPosition.TOP_LEFT].push(controlPanelDiv);

  var norgeskartBounds = new google.maps.LatLngBounds(new google.maps.LatLng(
			57.5, 3), new google.maps.LatLng(71, 31.5));

  google.maps.event.addListener(map, 'maptypeid_changed', function() {
	if (map.getMapTypeId() == 'norgeskart') {
		if (!norgeskartBounds.contains(map.getBounds().getCenter())) {
			map.panToBounds(norgeskartBounds);
			map.setZoom(5);
			return;
		}

	}
  });

google.maps.event.addListener(map, 'click', onClickMap);
}



