function onClickMap(clickedLocation) {
  // Create an ElevationService
  var elevator = new google.maps.ElevationService();
  //var infowindow = new google.maps.InfoWindow();
  var locations = [];
  // Retrieve the clicked location and push it on the array
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
	map.setCenter(clickedLocation);
	var  img = addSnoLayer('swewk', 'Snø endring siste uke');
	img += addSnoLayer('sd', 'Snødybde');
	img += addSnoLayer('lwc', 'Snøtilstand');
	img += addSnoLayer('sdfs', 'Nysnødybde');


img +=addMetChart(clickedLocation, 'http://h-web01.nve.no/chartserver/ShowChart.aspx?req=getchart&ver=1.0&time={fromdate}T0000;{todate}T0000&chs={width}x{height}&lang=no&chlf=none&chsl=0;+0&chhl=2|0|2&timeo=-06:00&app=3d&chd=ds=hgts,da=29,id={pos};swewk,cht=col,mth=inst&nocache=0.7853575034532696', -10, 5, 700, 300);

img +=addMetChart(clickedLocation, 'http://h-web01.nve.no/chartserver/ShowChart.aspx?req=getchart&ver=1.0&time={fromdate}T0000;{todate}T0000&chs={width}x{height}&lang=no&chlf=desc&chsl=0;+0&chhl=2|0|2&timeo=-06:00&app=3d&chd=ds=hgts,da=29,id={pos};fsw,cht=stckcol,mth=inst,clr=%233399FF|ds=hgts,da=29,id={pos};qsw,cht=stckcol,grp=1,mth=inst,clr=%23FF9933|ds=hgts,da=29,id={pos};qtt,cht=stckcol,grp=1,mth=inst,clr=red|ds=hgts,da=29,id={pos};tam,cht=line,mth=inst,drwd=3,clr=%23FF9933&nocache=0.2664557103998959', -20, 5, 700, 500);
	
        //infowindow.setContent('The elevation at ' + event.latLng +' <br>is ' + Math.round(results[0].elevation) + ' meters. ' + img);
        $('#controlPanel').hide();
	$('#contentInfo').fadeIn();
	$('#contentInfo').html('The elevation at ' + clickedLocation +' <br>is ' + Math.round(results[0].elevation) + ' meters. ' + img);
        //infowindow.setPosition(clickedLocation);
        //infowindow.open(map);
      } else {
        alert('No results found');
      }
    } else {
      alert('Elevation service failed due to: ' + status);
    }
  });
}

function addSnoLayer(layer, name) {
var date = toDateStringISO(new Date());
return getImg('http://gridwms.nve.no/WMS_server/wms_server.aspx?time=' + date + '&custRefresh=0.1345073445700109&SERVICE=WMS&REQUEST=GetMap&FORMAT=image/png&TRANSPARENT=TRUE&STYLES=&VERSION=1.1.1&LAYERS='+ layer +'&SRS=EPSG:32633&BBOX=', map.getBounds().getSouthWest(), map.getBounds().getNorthEast(), name);
}

function addMetChart(latLng, url, fromDays, toDays, width, height) {
  var p = proj4(epsg32633).forward([ latLng.lng(), latLng.lat() ]);
  var pos = p[0] + ";" + p[1];
  var fromDate = toDateString(addDays(new Date(), fromDays));
  var toDate = toDateString(addDays(new Date(), toDays));  
  url = url.replace(/\{fromdate}/g, fromDate);
  url = url.replace(/\{todate}/g, toDate);
  url = url.replace(/\{pos}/g, pos);
  url = url.replace(/\{width}/g, width);
  url = url.replace(/\{height}/g, height);
  return '<img width=' + width+ ' height='+ height +' src="'+ url +'">';
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


function getImg(url, latSw, latNe, name) {
var width = Math.round(document.getElementById('map-canvas').offsetWidth / 2);
var height = Math.round(document.getElementById('map-canvas').offsetHeight / 2);
	var bbox = getBbox(epsg32633, latSw, latNe);
	// var baseImage =
	// 'http://openwms.statkart.no/skwms1/wms.topo2?LAYERS=topo2_WMS&TRANSPARENT=TRUE&FORMAT=image/png&SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap&STYLES=&SRS=EPSG:32633&WIDTH=256&HEIGHT=256&BBOX='
	// + bbox;
	var baseImage = 'http://openwms.statkart.no/skwms1/wms.toporaster3?LAYERS=topografiskraster&TRANSPARENT=TRUE&FORMAT=image/png&SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap&STYLES=&SRS=EPSG:32633&WIDTH=' +width + '&HEIGHT=' + height + '&BBOX='
			+ bbox;
	var url = url + bbox + '&WIDTH=' +width + '&HEIGHT=' + height;
	var sw = proj4(epsg32633).forward([ latSw.lng(), latSw.lat() ]);
	var nw = proj4(epsg32633).forward([ latNe.lng(), latNe.lat() ]);
	var r = "<h3>" + name + "</h3>";
	r += '<div class="imagediv">';
	r += "<img  src='" + baseImage + "' width=700>";
	r += "<img class=layerImg src='" + url + "' width=700>";
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
function codeLatLng(latlng) {
    geocoder.geocode({'latLng': latlng}, function(results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
        if (results[1]) {
          console.log('result1', results[1])
          console.log('results', results);
          console.log(JSON.stringify(results))
          /*
          map.setZoom(11);
          marker = new google.maps.Marker({
              position: latlng,
              map: map
          });
          infowindow.setContent(results[1].formatted_address);
          infowindow.open(map, marker);
          */
        } else {
          alert('No results found');
        }
      } else {
        alert('Geocoder failed due to: ' + status);
      }
    });
    
    var request = {
            placeId: 'ChIJN6U_f8uoQEYRUI27VocAdnM'
          };

          var infowindow = new google.maps.InfoWindow();
          var service = new google.maps.places.PlacesService(map);

          service.getDetails(request, function(place, status) {
            /*  
            if (status == google.maps.places.PlacesServiceStatus.OK) {
              var marker = new google.maps.Marker({
                map: map,
                position: place.geometry.location
              });
              google.maps.event.addListener(marker, 'click', function() {
                infowindow.setContent(place.name);
                infowindow.open(map, this);
              });
            }
            */
            console.log('place', place, status, JSON.stringify(place))
          });

  }

//ChIJxyT3tPhgQEYRso5FeMZoLp4
/*
[{"address_components":[{"long_name":"910","short_name":"910","types":["street_number"]},
                        {"long_name":"Sudbøvegen","short_name":"Sudbøvegen","types":["route"]},
                        {"long_name":"Flatdal","short_name":"Flatdal","types":["postal_town"]},
                        {"long_name":"Seljord","short_name":"Seljord","types":["administrative_area_level_2","political"]},
                        {"long_name":"Telemark","short_name":"Telemark","types":["administrative_area_level_1","political"]},
                        {"long_name":"Norge","short_name":"NO","types":["country","political"]},
                        {"long_name":"3841","short_name":"3841","types":["postal_code"]}],"formatted_address":"Sudbøvegen 910, 3841 Flatdal, Norge",
                        "geometry":{"location":{"A":59.7111537,"F":8.339147300000036},"location_type":"ROOFTOP","viewport":{"za":{"A":59.7098047197085,"j":59.71250268029151},"qa":{"j":8.337798319708554,"A":8.340496280291518}}},
                        "place_id":"ChIJ5_ZIyfxOP0YRp9C2Syf80OI","types":["street_address"]},
                        {"address_components":[{"long_name":"Flatdal","short_name":"Flatdal","types":["postal_town"]},
                                               {"long_name":"Seljord","short_name":"Seljord","types":["administrative_area_level_2","political"]},
                                               {"long_name":"Telemark","short_name":"Telemark","types":["administrative_area_level_1","political"]},
                                               {"long_name":"Norge","short_name":"NO","types":["country","political"]},
                                               {"long_name":"3841","short_name":"3841","types":["postal_code"]}],
                                               "formatted_address":"3841 Flatdal, Norge","geometry":{"bounds":{"za":{"A":59.5208704,"j":59.795068},
                                                   "qa":{"j":8.20648779999999,"A":8.714946899999973}},"location":{"A":59.71401290000001,"F":8.35749809999993},
                                                   "location_type":"APPROXIMATE","viewport":{"za":{"A":59.5208704,"j":59.795068},"qa":{"j":8.20648779999999,"A":8.714946899999973}}},
                                                   "place_id":"ChIJD2wsVSZSP0YR5IZYnsXV9Yo","types":["postal_town"]},{"address_components":[{"long_name":"3841","short_name":"3841","types":["postal_code"]},
{"long_name":"Telemark","short_name":"Telemark","types":["administrative_area_level_1","political"]},
{"long_name":"Norge","short_name":"NO","types":["country","political"]}],"formatted_address":"3841, Norge","geometry":{"bounds":{"za":{"A":59.5208704,"j":59.795068},
    "qa":{"j":8.20648779999999,"A":8.714946899999973}},"location":{"A":59.71401290000001,"F":8.35749809999993},
    "location_type":"APPROXIMATE","viewport":{"za":{"A":59.5208704,"j":59.795068},"qa":{"j":8.20648779999999,"A":8.714946899999973}}},
    "place_id":"ChIJD2wsVSZSP0YRZBNuSBAIlQM","types":["postal_code"]},{"address_components":[{"long_name":"Seljord","short_name":"Seljord","types":
        ["administrative_area_level_2","political"]},{"long_name":"Telemark","short_name":"Telemark","types":["administrative_area_level_1","political"]},
{"long_name":"Norge","short_name":"NO","types":["country","political"]}],"formatted_address":"Seljord, Norge",
"geometry":{"bounds":{"za":{"A":59.35157150000001,"j":59.7950685},"qa":{"j":8.206493000000023,"A":8.91723550000006}},
    "location":{"A":59.71401290000001,"F":8.35749809999993},"location_type":"APPROXIMATE","viewport":{"za":{"A":59.35157150000001,"j":59.7950685},
    
    
        "qa":{"j":8.206493000000023,"A":8.91723550000006}}},"place_id":"ChIJf4wAjDmrOEYRXV80Iu7PfpU","types":["administrative_area_level_2","political"]},
      {"address_components":[{"long_name":"Telemark","short_name":"Telemark","types":["administrative_area_level_1","political"]},
{"long_name":"Norge","short_name":"NO","types":["country","political"]}],"formatted_address":"Telemark, Norge",
"geometry":{"bounds":{"za":{"A":58.76740489999999,"j":60.1882718},"qa":{"j":7.096287399999937,"A":9.895088100000066}},
    "location":{"A":59.39139849999999,"F":8.321120999999948},"location_type":"APPROXIMATE","viewport":{"za":{"A":58.7674306,"j":60.1882718},
        "qa":{"j":7.096287399999937,"A":9.895088100000066}}},"place_id":"ChIJybyAB_-rOEYRkByzKCZ3AQM","types":["administrative_area_level_1","political"]},{"address_components":[{"long_name":"Norge","short_name":"NO","types":["country","political"]}],"formatted_address":"Norge","geometry":{"bounds":{"za":{"A":57.9595703,"j":71.1854762},"qa":{"j":4.500096299999996,"A":31.168268399999988}},"location":{"A":60.47202399999999,"F":8.46894599999996},"location_type":"APPROXIMATE","viewport":{"za":{"A":57.9736345,"j":71.1854762},
            "qa":{"j":4.614225099999999,"A":31.149789199999987}}},"place_id":"ChIJv-VNj0VoEkYRK9BkuJ07sKE","types":["country","political"]}]

*/

//{"address_components":[{"long_name":"1140","short_name":"1140","types":["street_number"]},{"long_name":"Fylkesvei 211","short_name":"Fv211","types":["route"]},{"long_name":"Eggedal","short_name":"Eggedal","types":["postal_town"]},{"long_name":"Sigdal","short_name":"Sigdal","types":["administrative_area_level_2","political"]},{"long_name":"Buskerud","short_name":"Buskerud","types":["administrative_area_level_1","political"]},{"long_name":"Norge","short_name":"NO","types":["country","political"]},{"long_name":"3359","short_name":"3359","types":["postal_code"]}],"formatted_address":"Fylkesvei 211 1140, 3359 Eggedal, Norge","geometry":{"location":{"A":60.2566374,"F":9.29725570000005},"location_type":"ROOFTOP","viewport":{"za":{"A":60.25528841970849,"j":60.2579863802915},"qa":{"j":9.295906719708455,"A":9.298604680291533}}},"place_id":"ChIJtWj_AtaJQEYRaIXfA6Xp9rQ","types":["street_address"]},{"address_components":[{"long_name":"Flå","short_name":"Flå","types":["administrative_area_level_2","political"]},{"long_name":"Buskerud","short_name":"Buskerud","types":["administrative_area_level_1","political"]},{"long_name":"Norge","short_name":"NO","types":["country","political"]}],"formatted_address":"Flå, Norge","geometry":{"bounds":{"za":{"A":60.296659,"j":60.57192910000001},"qa":{"j":9.099160600000005,"A":9.8467177}},"location":{"A":60.3837212,"F":9.485904800000071},"location_type":"APPROXIMATE","viewport":{"za":{"A":60.296659,"j":60.57192910000001},"qa":{"j":9.099160600000005,"A":9.8467177}}},"place_id":"ChIJtbM7Ub5oQEYR1e-lMfxnUyA","types":["administrative_area_level_2","political"]},{"address_components":[{"long_name":"3539","short_name":"3539","types":["postal_code"]},{"long_name":"Buskerud","short_name":"Buskerud","types":["administrative_area_level_1","political"]},{"long_name":"Norge","short_name":"NO","types":["country","political"]}],"formatted_address":"3539, Norge","geometry":{"bounds":{"za":{"A":60.2966596,"j":60.57193030000001},"qa":{"j":9.09446909999997,"A":9.846716799999967}},"location":{"A":60.3837212,"F":9.485904800000071},"location_type":"APPROXIMATE","viewport":{"za":{"A":60.2966596,"j":60.57193030000001},"qa":{"j":9.09446909999997,"A":9.846716799999967}}},"place_id":"ChIJC7M7Ub5oQEYRjxTIzKS0eQk","types":["postal_code"]},{"address_components":[{"long_name":"Flå","short_name":"Flå","types":["postal_town"]},{"long_name":"Flå","short_name":"Flå","types":["administrative_area_level_2","political"]},{"long_name":"Buskerud","short_name":"Buskerud","types":["administrative_area_level_1","political"]},{"long_name":"Norge","short_name":"NO","types":["country","political"]},{"long_name":"3539","short_name":"3539","types":["postal_code"]}],"formatted_address":"3539 Flå, Norge","geometry":{"bounds":{"za":{"A":60.2966596,"j":60.57193030000001},"qa":{"j":9.09446909999997,"A":9.846716799999967}},"location":{"A":60.3837212,"F":9.485904800000071},"location_type":"APPROXIMATE","viewport":{"za":{"A":60.2966596,"j":60.57193030000001},"qa":{"j":9.09446909999997,"A":9.846716799999967}}},"place_id":"ChIJC7M7Ub5oQEYRYxHSDAYm0W0","types":["postal_town"]},{"address_components":[{"long_name":"Buskerud","short_name":"Buskerud","types":["administrative_area_level_1","political"]},{"long_name":"Norge","short_name":"NO","types":["country","political"]}],"formatted_address":"Buskerud, Norge","geometry":{"bounds":{"za":{"A":59.4078708,"j":61.0917205},"qa":{"j":7.438842300000033,"A":10.619260599999961}},"location":{"A":60.48460249999999,"F":8.69837640000003},"location_type":"APPROXIMATE","viewport":{"za":{"A":59.4078708,"j":61.0917205},"qa":{"j":7.438842300000033,"A":10.619260599999961}}},"place_id":"ChIJe8BoDMeAQEYRcByzKCZ3AQM","types":["administrative_area_level_1","political"]},{"address_components":[{"long_name":"Norge","short_name":"NO","types":["country","political"]}],"formatted_address":"Norge","geometry":{"bounds":{"za":{"A":57.9595703,"j":71.1854762},"qa":{"j":4.500096299999996,"A":31.168268399999988}},"location":{"A":60.47202399999999,"F":8.46894599999996},"location_type":"APPROXIMATE","viewport":{"za":{"A":57.9736345,"j":71.1854762},"qa":{"j":4.614225099999999,"A":31.149789199999987}}},"place_id":"ChIJv-VNj0VoEkYRK9BkuJ07sKE","types":["country","political"]}]

