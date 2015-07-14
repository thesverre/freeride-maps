function onClickMap(clickedLocation, inName) {
  var elevator = new google.maps.ElevationService();
  var locations = [];
  // Retrieve the clicked location and push it on the array
  locations.push(clickedLocation);
 
	// http://www.yr.no/_/websvc/latlon2p.aspx?lat=59.91&lon=10.78&spr=nob
  // https://en.wikipedia.org/w/api.php?action=query&list=geosearch&gsradius=10000&gscoord=61.08485672110025%7C8.360595703125
  
  // Create a LocationElevationRequest object using the array's one value
  var positionalRequest = {
    'locations': locations
  }

  // Initiate the location request
  elevator.getElevationForLocations(positionalRequest, function(results, status) {
	var elevation = 'Ukjent';
    if (status == google.maps.ElevationStatus.OK) {
    	if (results[0]) {
      	  elevation = Math.round(results[0].elevation);
    	}
    }
      // Retrieve the first result
      
        // Open an info window indicating the elevation at the clicked position
	$.get('php/fetch.php?type=yr&lat='+ clickedLocation.lat() + '&lon=' +clickedLocation.lng() , function(response) {
		var loc = $($.parseXML( response )).find('location').first();
		var distance = loc.attr('d');
		var translation = loc.find('translation');
		var path = translation.attr('path');
		var name = translation.attr('name');
		//map.setCenter(clickedLocation);
		var header; 
		if (inName) {
			header = inName +' (' + Math.round(elevation) + ' moh)';
		} else {
			header =  elevation + ' moh, ' + distance + ' m fra ' + name + '<div class="position">' + clickedLocation.toString() + '</div>' ;
		}
		var  img = '';
		
		img +='<div class=graphcontainer>';
		img +=  getRawImg('http://www.yr.no' + path + '/avansert_meteogram.png', 'Værvarsel '  + name, 'Data er hentet fra yr.no. Se detaljert værvarsel <a target="_blank"  href="http://www.yr.no'+ path+'">her</a>');

		//img +=addMetChart("Nysnø siste 20 dager + 10 dagers varsel", clickedLocation, 'http://h-web01.nve.no/chartserver/ShowChart.aspx?req=getchart&ver=1.0&time={fromdate}T0000;{todate}T0000&chs={width}x{height}&lang=no&chlf=none&chsl=0;+0&chhl=2|0|2&timeo=-06:00&app=3d&chd=ds=hgts,da=29,id={pos};swewk,cht=col,mth=inst&nocache=0.7853575034532696', -10, 5, 700, 300);
		var bbox = getBbox(epsg32633, map.getBounds().getSouthWest(), map.getBounds().getNorthEast());
		bbox = bbox.replace(/,/g, '|');
		var senorgeUrl = 'http://www.senorge.no/?p=senorgeny&m=bmNVEGrey;MapLayer_swewk;&l=no&d=1433736000000&e=' + bbox + '&fh=0;2468';
		img +=addMetChart("Nedbør og temperatur siste 8 dager + 5 dagers varsel", clickedLocation, 'http://h-web01.nve.no/chartserver/ShowChart.aspx?req=getchart&ver=1.0&time={fromdate}T0000;{todate}T0000&chs={width}x{height}&lang=no&chlf=desc&chsl=0;+0&chhl=2|0|2&timeo=-06:00&app=3d&chd=ds=hgts,da=29,id={pos};fsw,cht=stckcol,mth=inst,clr=%233399FF|ds=hgts,da=29,id={pos};qsw,cht=stckcol,grp=1,mth=inst,clr=%23FF9933|ds=hgts,da=29,id={pos};qtt,cht=stckcol,grp=1,mth=inst,clr=red|ds=hgts,da=29,id={pos};tam,cht=line,mth=inst,drwd=3,clr=%23FF9933&nocache=0.2664557103998959', -8, 5, 700, 280, 'Data er hentet fra senorge.no. Se detaljer <a target="_blank"  href="'+ senorgeUrl+'">her</a>');

		img +='</div><div class=snocontainer>';
		img +=addSnoLayer(clickedLocation, 'swewk', 'Snø endring');
		img += addSnoLayer(clickedLocation, 'sd', 'Snødybde');
		img += addSnoLayer(clickedLocation, 'lwc', 'Snøtilstand');
		img += addSnoLayer(clickedLocation, 'sdfsw', 'Nysnødybde');
		img += '<div style="clear:both"><div class="snodesc">*I dag -/+ 3 dager</div>';
		img +='</div>';
		var html = '<div class="gallery">' +  img + '</div>';
		
		var p = proj4(epsg32633).forward([ clickedLocation.lng(), clickedLocation.lat() ]);
		html +='<div class="links">';
		html +='Se detaljer:';
		html +='<br><a target="_blank"  href="http://ut.no/finn/?lat='+ clickedLocation.lat() +'&lon=' + clickedLocation.lng()+'&types=trip&type=geolocation">ut.no</a>';
		html +='<br><a target="_blank"  href="http://www.yr.no'+ path+'">yr.no</a>';
		html +='<br><a target="_blank"  href="'+ senorgeUrl+'">senorge.no</a>';
		html +='<br><a target="_blank"  href="https://www.google.com/maps?ll='+ clickedLocation.lat() +',' + clickedLocation.lng()+'&z=' + map.getZoom() +'">maps.google.com</a>';
		html +='<br><a target="_blank"  href="http://www.norgeskart.no/#' + (map.getZoom()-2) + '/' + p[0] + '/' + p[1] + '">norgeskart.no</a>';
		html +='<br><a target="_blank" href="http://www.lookr.com/no#!explore/' + clickedLocation.lat() + ';' + clickedLocation.lng() + '">lookr.com</a>';
		html +='<br><a target="_blank"  href="http://www.webcams.travel/map/#lat='+ clickedLocation.lat() +'&lng=' + clickedLocation.lng()+'&z=' + map.getZoom() +'&t=n">www.webcams.travel</a>';
		html +='<br><a target="_blank"  href="http://youtube.github.io/geo-search-tool/search.html?q=&la='+ clickedLocation.lat() +'&lo=' + clickedLocation.lng()+'&lr=10km&tw=any&cl=&sl='+ clickedLocation.lat() +  '%20' + clickedLocation.lng()+ '&eo=false&loo=false&cco=false&zl=11&pbt=2015-06-19T17:46:11Z">youtube.com</a>';
		html +='<br><a target="_blank"  href="http://www.gramfeed.com/instagram/map#/' + clickedLocation.lat() +',' + clickedLocation.lng() + '/1000/-">instagram.com</a>';
		
		
		html +='<br><br>Lenker:';
		html +='<br><a target="_blank"  href="http://www.varsom.no">varsom.no</a>';
		html +='<br><a target="_blank"  href="http://sjogg.no">sjogg.no</a>';
		html +='<br><a target="_blank"  href="http://randopedia.net">randopedia.no</a>';
		
		
		html += '</div>';
		//$('#overlaycontent').html(html);
        var minihtml = '';
        minihtml = '<div class="smallcontainer"><div style="float:left"><h3>' + header + '</h3></div>' + addSmallSnoInfo(clickedLocation) + '</div>';
        var display = $('.overlay').hasClass('overlay-expanded') ? 'block' : 'none';
        $('#overlaycontent').html(minihtml + '<div style="clear:both;display:'+ display + '" class="largecontainer">' + html +'</div>');        
		if (!$('.overlay').hasClass('open')) {
			toggleOverlay();
		}
	

	});
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
    
    var startdate = toDateStringISO(addDays(new Date(), -3));
    var enddate = toDateStringISO(addDays(new Date(), 3));
    
    var p = proj4(epsg32633).forward([ latLng.lng(), latLng.lat() ]);
    var pos = p[0] + ";" + p[1];
    name = name + ' <span id="info_' + layer + '"></span>' ;
    var url = 'php/fetch.php?type=nve&x=' + p[0] + '&y=' + p[1] + '&layer=' + layer + '&startdate=' + startdate + '&enddate=' + enddate;
    var result = getImg(latLng, 'http://gridwms.nve.no/WMS_server/wms_server.aspx?time=' + date + '&custRefresh=0.1345073445700109&SERVICE=WMS&REQUEST=GetMap&FORMAT=image/png&TRANSPARENT=TRUE&STYLES=&VERSION=1.1.1&LAYERS='+ layer +'&SRS=EPSG:32633&BBOX=', latLng, name);
    $.get(url, function(result) {
        result = $.parseJSON(result);
        
        var pre = Math.round(result.MapGridValue[0] + result.MapGridValue[1] + result.MapGridValue[2]);
        var post = Math.round(result.MapGridValue[4] + result.MapGridValue[5] + result.MapGridValue[6]);
        if (layer == 'sd' || layer == 'lwc') {
            pre = Math.round(pre / 3);
            post = Math.round(post / 3);
        }
        $('#info_' + layer).html('('+ result.MapGridValue[3] + ' ' + result.Unit + ', ' + pre + ' ' + result.Unit +' / ' + post + ' ' + result.Unit + ')' );
    });
    return result;
}

function addSmallSnoInfo(latLng) {
    var date = toDateStringISO(new Date());

    var startdate = toDateStringISO(addDays(new Date(), -3));
    var enddate = toDateStringISO(addDays(new Date(), 3));

    var p = proj4(epsg32633).forward([ latLng.lng(), latLng.lat() ]);
    var pos = p[0] + ";" + p[1];
    var url = 'php/fetch.php?type=nve&x=' + p[0] + '&y=' + p[1] +  '&startdate=' + startdate + '&enddate=' + enddate+ '&layer=';
    var html = '';
    $.get(url + 'sd', function(result) {
        result = $.parseJSON(result);
        html +='Snødybde: ' + result.MapGridValue[3] + ' ' + result.Unit;
        $.get(url + 'lwc', function(result) {
            result = $.parseJSON(result);
            var type = '';
            if (result.MapGridValue[3] < 30) {
                type = 'Pudder '; 
            } else if (result.MapGridValue[3] > 60) {
                type = 'Våt ';
            }
            html += ' (' + type  + result.MapGridValue[3] + ' ' + result.Unit  + ')';
            $.get(url + 'sdfsw', function(result) {
                result = $.parseJSON(result);
                var pre = Math.round(result.MapGridValue[0] + result.MapGridValue[1] + result.MapGridValue[2]);
                var post = Math.round(result.MapGridValue[3] + result.MapGridValue[4] + result.MapGridValue[5] + result.MapGridValue[6]);
                html += '<br>Nysnø forrige 3 dager: ' +   pre + ' ' + result.Unit;
                html += '<br>Nysnø idag og neste 3 dager: ' +   post + ' ' + result.Unit;
                $('.smallsnocontainer').html(html).fadeIn();
            });
        });
    });
    return '<div class="smallsnocontainer" style="display:none" ></div>';
}

function addMetChart(name, latLng, url, fromDays, toDays, width, height, desc) {
  var p = proj4(epsg32633).forward([ latLng.lng(), latLng.lat() ]);
  var pos = p[0] + ";" + p[1];
  var fromDate = toDateString(addDays(new Date(), fromDays));
  var toDate = toDateString(addDays(new Date(), toDays));  
  url = url.replace(/\{fromdate}/g, fromDate);
  url = url.replace(/\{todate}/g, toDate);
  url = url.replace(/\{pos}/g, pos);
  url = url.replace(/\{width}/g, width);
  url = url.replace(/\{height}/g, height);
  return getRawImg(url, name, desc);
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
function getRawImg(url, name, desc) {
var r = '<figure class="chart" onclick="zoomElm(this)">' 
if (name) {
  r += '<figcaption>' + name + '</figcaption>';
}
r += '<div class="imgcontainter">';
r += '<img src="'+ url+ '" width="100%">';
r += '</div>';
if (desc) {
	  r += '<div class="description">' + desc+ '</div>';
	}
r += '</figure>';
return r;
}


function getImg(latlng, url, latlng, name) {
var width = Math.round(document.getElementById('map-canvas').offsetWidth);
var height = Math.round(document.getElementById('map-canvas').offsetHeight);
var r = proj4(epsg32633).forward([ latlng.lng(), latlng.lat() ]);
var zoom = map.getZoom();
var scale = [20000000, 6200000, 3000000, 1000000, 500000, 200000, 75000, 
        25000, 12500, 6250, 3125, 1675, 900, 450, 225]
if (zoom >= scale.length) {
 zoom = scale.length -1;
}
var diff = scale[zoom]*4;
var diffx = Math.round(diff*1.333333);
var diffy = diff;
var bbox = (r[0]- diffx) + "," + (r[1] - diffy) + "," + (r[0] + diffx) + "," + (r[1] + diffy);
width = 400;
height = 280;
	//var bbox = getBbox(epsg32633, latSw, latNe);
	// var baseImage =
	// 'http://openwms.statkart.no/skwms1/wms.topo2?LAYERS=topo2_WMS&TRANSPARENT=TRUE&FORMAT=image/png&SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap&STYLES=&SRS=EPSG:32633&WIDTH=256&HEIGHT=256&BBOX='
	// + bbox;
	var baseImage = 'http://openwms.statkart.no/skwms1/wms.toporaster3?LAYERS=topografiskraster&TRANSPARENT=TRUE&FORMAT=image/png&SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap&STYLES=&SRS=EPSG:32633&WIDTH=' +width + '&HEIGHT=' + height + '&BBOX='
			+ bbox;
	var url = url + bbox + '&WIDTH=' +width + '&HEIGHT=' + height;
	var r = "<figure class=chart onclick='zoomElm(this)' ><figcaption>" + name + "</figcaption>";
	r += '<div class="imgcontainter imagediv">';
	r += "<img  src='" + baseImage + "' width=100%>";
	r += "<img class=layerImg src='" + url + "' width=100%>";
	r += '</div></figure>';
	return r;
}

function zoomElm(o) {
	if (document.getElementById('map-canvas').offsetWidth < 1810) {
		return;
	} 
	$('#zoomcontainer').show();
	var p = $(o);
	document.pp = p;
	var newNode = o.cloneNode(true);
	var z = document.getElementById("zoomcontainer");
	var d = document.createElement('div');
	d.appendChild(newNode);
	$(z).empty();
	z.appendChild(d);
	var d = $(d);
	d.addClass('zoom');
	var offset = p.offset(); 
	d.offset({ top: offset.top, left: offset.left});
	//z.attr("style", '');
	
	var x = Math.round(offset.left * -1) + Math.round(p.width() / 2);
	x = Math.round(x /2);
	x = x +5;
	
	var y = Math.round(offset.top * -1);
	y = Math.round(y /2);
	y = y +5;
	if (p.width() > 500) {
		y = y +85;
		x = x + 15;
	}
	//var y = Math.round((p.height() / 2) * -1);
	var css = {"transform": "scale(2,2) translateX("+ x + "px) translateY("+ y + "px)", "transition": "transform 0.5s", 
			"z-index": 100};
	console.log('css', css, offset);
	d.css(css );
	d.find('.chart').removeClass('chart');
	$(z).show();
	/*
	$('#overlaycontent').removeClass('overlayshow');
	$('#overlaycontent').addClass('overlaydim');
	$('#overlaycontent').parent().on('transitionend', function() {
		//document.getElementById('overlaycontent').style.visibility = 'hidden';
	});*/
	$('#overlaycontent').addClass('open').fadeOut();
	
	
}

function getBbox(epsg, latSw, latNe) {
	var sw = proj4(epsg).forward([ latSw.lng(), latSw.lat() ]);
	var nw = proj4(epsg).forward([ latNe.lng(), latNe.lat() ]);
	return sw[0] + "," + sw[1] + "," + nw[0] + "," + nw[1];
}

function closeLayer() {
  $('.controlpanel').hide();
  $('.controlpanelicon').show();
}
function showLayer() {
	$('.controlpanel').show();
	$('.controlpanelicon').hide();
}
function ControlPanel(controlDiv, map) {

  // Set CSS for the control border
  var controlUI = document.createElement('div');
 controlUI.className='controlpanel';
 controlDiv.appendChild(controlUI);

  var closeButton = '<div onclick="closeLayer()" class="close-button">X</div>';
  var c = document.createElement('div');
  c.innerHTML = closeButton;
  controlUI.appendChild(c);
  var header = document.createElement('h2');
  header.innerHTML = "Data";
  //controlUI.appendChild(header);


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


function toggleOverlay() {
	if ($('#overlaycontent').hasClass( 'open' )) {
		$('.zoom figure').addClass('zoom-close');
		$('.zoom figure').parent().bind('transitionend', function() {
			$('#zoomcontainer').hide();
		});
		$('#overlaycontent').removeClass('open').fadeIn();
		return;
	}
    var transEndEventName = 'transitionend';
    if( $('.overlay').hasClass( 'open' ) ) {
        $('.overlay').removeClass( 'open' );
        $('.container').removeClass( 'overlay-open' );
        $('.overlay').addClass('close' );
        var onEndTransitionFn = function( ev ) {
            if( ev.propertyName !== 'visibility' ) return;
            this.removeEventListener( transEndEventName, onEndTransitionFn );
            
            $('.overlay').removeClass( 'close' );
        };
       
        document.querySelector('div.overlay').addEventListener( transEndEventName, onEndTransitionFn );
        
    }
    else if( !$('.overlay').hasClass( 'close' ) ) {
        $('.overlay').addClass( 'open' );
        $('.container').addClass( 'overlay-open' );
    }
}

