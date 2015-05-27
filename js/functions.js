
function onClickMap(event) {
  // Create an ElevationService
  var elevator = new google.maps.ElevationService();
  var infowindow = new google.maps.InfoWindow();
  var locations = [];

  // Retrieve the clicked location and push it on the array
  var clickedLocation = event.latLng;
  locations.push(clickedLocation);

  // Create a LocationElevationRequest object using the array's one value
  var positionalRequest = {
    'locations': locations
  }

  // Initiate the location request
  elevator.getElevationForLocations(positionalRequest, function(results, status) {
    if (status == google.maps.ElevationStatus.OK) {

      // Retrieve the first result
      if (results[0]) {

        // Open an info window indicating the elevation at the clicked position
	var  img = getImg('http://gridwms.nve.no/WMS_server/wms_server.aspx?time=2014-04-15&custRefresh=0.1345073445700109&SERVICE=WMS&REQUEST=GetMap&FORMAT=image/png&TRANSPARENT=TRUE&STYLES=&VERSION=1.1.1&LAYERS=swewk&WIDTH=256&HEIGHT=256&SRS=EPSG:32633&BBOX=', map.getBounds().getSouthWest(), map.getBounds().getNorthEast());
        infowindow.setContent('The elevation at ' + event.latLng +' <br>is ' + Math.round(results[0].elevation) + ' meters. ' + img);
        infowindow.setPosition(clickedLocation);
        infowindow.open(map);
      } else {
        alert('No results found');
      }
    } else {
      alert('Elevation service failed due to: ' + status);
    }
  });
}



function getImg(url, latSw, latNe) {
	var bbox = getBbox(epsg32633, latSw, latNe);
	// var baseImage =
	// 'http://openwms.statkart.no/skwms1/wms.topo2?LAYERS=topo2_WMS&TRANSPARENT=TRUE&FORMAT=image/png&SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap&STYLES=&SRS=EPSG:32633&WIDTH=256&HEIGHT=256&BBOX='
	// + bbox;
	var baseImage = 'http://openwms.statkart.no/skwms1/wms.toporaster3?LAYERS=topografiskraster&TRANSPARENT=TRUE&FORMAT=image/png&SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap&STYLES=&SRS=EPSG:32633&WIDTH=256&HEIGHT=256&BBOX='
			+ bbox;
	var url = url + bbox;
	var sw = proj4(epsg32633).forward([ latSw.lng(), latSw.lat() ]);
	var nw = proj4(epsg32633).forward([ latNe.lng(), latNe.lat() ]);

	var r = '<div class="imagediv">';
	r += "<img  src='" + baseImage + "' height=256 width=256>";
	r += "<img class=layerImg src='" + url + "' height=256 width=256>";
	r += '</div>';
	return r;
}

function getBbox(epsg, latSw, latNe) {
	var sw = proj4(epsg).forward([ latSw.lng(), latSw.lat() ]);
	var nw = proj4(epsg).forward([ latNe.lng(), latNe.lat() ]);
	return sw[0] + "," + sw[1] + "," + nw[0] + "," + nw[1];
}


function ControlPanel(controlDiv, map) {

  // Set CSS for the control border
  var controlUI = document.createElement('div');
 controlUI.className='controlpanel';
  controlDiv.appendChild(controlUI);

  var header = document.createElement('h2');
  header.innerHTML = "Data";
  controlUI.appendChild(header);


  // Set CSS for the control interior
  var ui = document.createElement('ul');
  ui.appendChild(addLayer('clouds_precipitation_regional', 'Skyer')); 
  ui.appendChild(addLayer('radar_precipitation_intensity', 'Radar')); 
  ui.appendChild(addLayer('temperature_2m_regional', 'Temperatur')); 
  ui.appendChild(addLayer('wind_10m_regional', 'Vind')); 
  ui.appendChild(addLayer('none', 'Ingen', true)); 
  controlUI.appendChild(ui);

}

function addLayer(layerId, name, active ) {
	var li = document.createElement('ul');
	li.className = 'layer';
	if (active) {
		li.className += ' active';
	}
	li.innerHTML = name;
	google.maps.event.addDomListener(li, 'click', function() {
		map.overlayMapTypes.clear();
		$('.active').removeClass('active');
		$(this).addClass('active');
		if (layerId == 'clouds_precipitation_regional') {
			addYrLayer('clouds_precipitation_regional');
		} else if (layerId == 'radar_precipitation_intensity') {
			addYrLayer('radar_precipitation_intensity');
		} else if (layerId == 'temperature_2m_regional') {
			addYrLayer('temperature_2m_regional');
		} else if (layerId == 'wind_10m_regional') {
			addYrLayer('wind_10m_regional');
		}

	});
	return li;
}

function addYrLayer(layerId) {
	function preZero(d) {
		if (d < 10) {
			return '0' + d;
		}
		return d;
	}
	var d = new Date();
	var time = d.getUTCFullYear() + "-" + preZero((d.getUTCMonth() + 1)) + "-"
			+ preZero(d.getUTCDate()) + "T" + d.getUTCHours() + ":00Z";
	loadWMS(map, 'http://public-wms.met.no/verportal/verportal.map?LAYERS='
			+ layerId + '&WIDTH=1024&HEIGHT=1024&TIME=' + time + '&'
			+ getWmsStandardParams(), {
		tileWidth : 1024,
		tileHeight : 1024,
		opacity : 0.5,
		maxZoomVisible : 10
	});

	loadWMS(map, 'http://public-wms.met.no/verportal/verportal.map?LAYERS='
			+ layerId + '&WIDTH=384&HEIGHT=384&TIME=' + time + '&'
			+ getWmsStandardParams(), {
		tileWidth : 1048,
		tileHeight : 1048,
		opacity : 0.5,
		minZoomVisible : 11
	});
}
