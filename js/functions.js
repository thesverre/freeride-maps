function onClickMap(clickedLocation, inName) {
  // Create an ElevationService
  var elevator = new google.maps.ElevationService();
  //var infowindow = new google.maps.InfoWindow();
  var locations = [];
  // Retrieve the clicked location and push it on the array
  locations.push(clickedLocation);
 
	// http://www.yr.no/_/websvc/latlon2p.aspx?lat=59.91&lon=10.78&spr=nob
  
  // Create a LocationElevationRequest object using the array's one value
  var positionalRequest = {
    'locations': locations
  }

  // Initiate the location request
  elevator.getElevationForLocations(positionalRequest, function(results, status) {
    if (status == google.maps.ElevationStatus.OK) {

      // Retrieve the first result
      if (results[0]) {
 	console.log('elevation' + Math.round(results[0].elevation));
        // Open an info window indicating the elevation at the clicked position
	$.get('php/fetch.php?lat='+ clickedLocation.lat() + '&lon=' +clickedLocation.lng() , function(response) {
		var loc = $($.parseXML( response )).find('location').first();
		var distance = loc.attr('d');
		var translation = loc.find('translation');
		var path = translation.attr('path');
		var name = translation.attr('name');
		//map.setCenter(clickedLocation);
		var header; 
		if (inName) {
			header = inName +' (' + Math.round(results[0].elevation) + ' moh)';
		} else {
			header = clickedLocation.toString() + ' (' + Math.round(results[0].elevation) + ' moh, ' + distance + ' m fra ' + name + ')';
		}
		var  img = ''; 

		img +=  getRawImg('http://www.yr.no' + path + '/avansert_meteogram.png', 'Værvarsel '  + name);

		//img +=addMetChart("Nysnø siste 20 dager + 10 dagers varsel", clickedLocation, 'http://h-web01.nve.no/chartserver/ShowChart.aspx?req=getchart&ver=1.0&time={fromdate}T0000;{todate}T0000&chs={width}x{height}&lang=no&chlf=none&chsl=0;+0&chhl=2|0|2&timeo=-06:00&app=3d&chd=ds=hgts,da=29,id={pos};swewk,cht=col,mth=inst&nocache=0.7853575034532696', -10, 5, 700, 300);

		img +=addMetChart("Nedbør og temperatur siste 10 dager + 5 dagers varsel", clickedLocation, 'http://h-web01.nve.no/chartserver/ShowChart.aspx?req=getchart&ver=1.0&time={fromdate}T0000;{todate}T0000&chs={width}x{height}&lang=no&chlf=desc&chsl=0;+0&chhl=2|0|2&timeo=-06:00&app=3d&chd=ds=hgts,da=29,id={pos};fsw,cht=stckcol,mth=inst,clr=%233399FF|ds=hgts,da=29,id={pos};qsw,cht=stckcol,grp=1,mth=inst,clr=%23FF9933|ds=hgts,da=29,id={pos};qtt,cht=stckcol,grp=1,mth=inst,clr=red|ds=hgts,da=29,id={pos};tam,cht=line,mth=inst,drwd=3,clr=%23FF9933&nocache=0.2664557103998959', -20, 5, 700, 500);

		img +=addSnoLayer(clickedLocation, 'swewk', 'Snø endring siste uke');
		img += addSnoLayer(clickedLocation, 'sd', 'Snødybde');
		img += addSnoLayer(clickedLocation, 'lwc', 'Snøtilstand');
		img += addSnoLayer(clickedLocation, 'sdfsw', 'Nysnødybde');

	
		//infowindow.setContent('The elevation at ' + event.latLng +' <br>is ' + Math.round(results[0].elevation) + ' meters. ' + img);

		var closeButton = '<div onclick="closeClickMap()" class="close-button">X</div><div style="clear:both"></div>';
		$('#controlPanel').hide();
		//$('#contentInfo').fadeIn();
		//$('#contentInfo').html('<div style="float:left"><h2>' + header + '</h2></div>' + closeButton + img);
		$('#overlaycontent').html('<h2>' + header + '</h2><div class="gallery">' +  img + '</div>');
		toggleOverlay();
	
		$('.gallery').magnificPopup({'delegate' : 'a', 
		type:'image',
		mainClass: 'mfp-with-zoom', // this class is for CSS animation below
		  gallery:{enabled:true},
		  zoom: {
		    enabled: true, // By default it's false, so don't forget to enable it

		    duration: 300, // duration of the effect, in milliseconds
		    easing: 'ease-in-out', // CSS transition easing function 

		    // The "opener" function should return the element from which popup will be zoomed in
		    // and to which popup will be scaled down
		    // By defailt it looks for an image tag:
		    opener: function(openerElement) {
		      // openerElement is the element on which popup was initialized, in this case its <a> tag
		      // you don't need to add "opener" option if this code matches your needs, it's defailt one.
		      return openerElement.is('img') ? openerElement : openerElement.find('img');
		    }
		  }

		});

		//infowindow.setPosition(clickedLocation);
		//infowindow.open(map);

	});

      } else {
        alert('No results found');
      }
    } else {
      alert('Elevation service failed due to: ' + status);
    }
  });
}

function closeClickMap() {
  $('#contentInfo').hide();
  $('#controlPanel').fadeIn();
  marker.setMap(null);
  marker = null;
}

function addSnoLayer(latLng, layer, name) {
var date = toDateStringISO(new Date());
return getImg('http://gridwms.nve.no/WMS_server/wms_server.aspx?time=' + date + '&custRefresh=0.1345073445700109&SERVICE=WMS&REQUEST=GetMap&FORMAT=image/png&TRANSPARENT=TRUE&STYLES=&VERSION=1.1.1&LAYERS='+ layer +'&SRS=EPSG:32633&BBOX=', latLng, name);
}

function addMetChart(name, latLng, url, fromDays, toDays, width, height) {
  var p = proj4(epsg32633).forward([ latLng.lng(), latLng.lat() ]);
  var pos = p[0] + ";" + p[1];
  var fromDate = toDateString(addDays(new Date(), fromDays));
  var toDate = toDateString(addDays(new Date(), toDays));  
  url = url.replace(/\{fromdate}/g, fromDate);
  url = url.replace(/\{todate}/g, toDate);
  url = url.replace(/\{pos}/g, pos);
  url = url.replace(/\{width}/g, width);
  url = url.replace(/\{height}/g, height);
  return getRawImg(url, name);
}


function addDays(date, days) {
    var result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}
function toDateString(date) {
  return date.getFullYear() + '' + preZero((date.getMonth() + 1)) + '' + preZero(date.getDate());
}

function toDateStringISO(date) {
  return date.getFullYear() + '-' + preZero((date.getMonth() + 1)) + '-' + preZero(date.getDate());
}
function getRawImg(url, name) {
var r = '<figure class="chart">' 
if (name) {
  r += '<figcaption>' + name + '</figcaption>';
}
r += '<a href="'+ url +'" data-lightbox="'+ url+ '" data-title="' + name+ '"><img src="'+ url+ '" width="100%"></a>';
r += '</figure>';
return r;
}


function getImg(url, latlng, name) {
var width = Math.round(document.getElementById('map-canvas').offsetWidth);
var height = Math.round(document.getElementById('map-canvas').offsetHeight);
var latlng = map.getCenter();
var r = proj4(epsg32633).forward([ latlng.lng(), latlng.lat() ]);
var zoom = map.getZoom();
var scale = [20000000, 20000000, 6200000, 3000000, 1000000, 500000, 200000, 75000, 
        25000, 12500, 6250, 3125, 1675]
if (zoom >= scale.length) {
 zoom = scale.length -1;
}
var diff = scale[zoom];
console.log(zoom, diff);
var bbox = (r[0]- diff) + "," + (r[1] - diff) + "," + (r[0] + diff) + "," + (r[1] + diff);
width = 200;
height = 200;
	//var bbox = getBbox(epsg32633, latSw, latNe);
	// var baseImage =
	// 'http://openwms.statkart.no/skwms1/wms.topo2?LAYERS=topo2_WMS&TRANSPARENT=TRUE&FORMAT=image/png&SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap&STYLES=&SRS=EPSG:32633&WIDTH=256&HEIGHT=256&BBOX='
	// + bbox;
	var baseImage = 'http://openwms.statkart.no/skwms1/wms.toporaster3?LAYERS=topografiskraster&TRANSPARENT=TRUE&FORMAT=image/png&SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap&STYLES=&SRS=EPSG:32633&WIDTH=' +width + '&HEIGHT=' + height + '&BBOX='
			+ bbox;
	var url = url + bbox + '&WIDTH=' +width + '&HEIGHT=' + height;
	var r = "<figure class=chart><figcaption>" + name + "</figcaption>";
	r += '<a data-lightbox=f><div class="imagediv">';
	r += "<img  src='" + baseImage + "' width=100%>";
	r += "<img class=layerImg src='" + url + "' width=100%>";
	r += '</div></a></figure>';
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
  ui.appendChild(addLayer('skred', 'Skredfare')); 
  ui.appendChild(addLayer('bratthet', 'Bratthet'));
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

		} else if (layerId == 'skred') {
			loadWMS(map, 'http://gis3.nve.no/map/rest/services/SkredSnoAktR/MapServer/export?dpi=96&transparent=true&format=png8&bboxSR=3857&imageSR=3857&size=1024%2C1024&layers=show%3A0&f=image&', {
			tileWidth : 1024,
			tileHeight : 1024,
			opacity : 0.5,
			maxZoomVisible : 10
			});
		} else if (layerId == 'bratthet') {			
		    loadWMS(map, 'http://gis.nve.no/ArcGIS/rest/services/Mapservices/Bakgrunnsdata/MapServer/export?dpi=96&transparent=true&format=png8' 
		              + '&layers=show%3A52%2C53%2C54&bboxSR=3857&imageSR=3857&size=1024%2C1024&f=image&', {
		        tileWidth : 1024,
		        tileHeight : 1024,
		        opacity : 0.5
		    });
		    
		}

	});
	return li;
}

function addYrLayer(layerId) {
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

function preZero(d) {
	if (d < 10) {
		return '0' + d;
	}
	return d;
}

