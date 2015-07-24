function onClickMap(clickedLocation, inName) {
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
		var header; 
		if (inName) {
			header = inName +' (' + Math.round(elevation) + ' moh)';
		} else {
			header = name +' (' + Math.round(elevation) + ' moh)<div class="position">' + distance + ' m fra ' + clickedLocation.toString() + '</div>' ;
		}
		
        var minihtml = '<div class="smallcontainer"><div style="float:left"><h3>' + header + '</h3></div>' + addSmallSnoInfo(clickedLocation) + '<div class="smallgallery"><div class="flexslider"><ul class="slides"></ul></div></div></div>';
        
        
        if ($('.overlay').hasClass('overlay-expanded')) {
            $('#overlaycontent').html(minihtml + '<div style="clear:both;" class="largecontainer">' + addLargeContainer(clickedLocation, path, name) + '</div>');
            $('.largecontainer').data('data', [clickedLocation, path, name]);
        } else {
        	$('.controlpanel').addClass('open');
        	$('.controlpanel').removeClass( 'close' );
            $('#overlaycontent').html(minihtml + '<div style="clear:both;display:none" class="largecontainer">' + '</div>');
            $('.largecontainer').data('data', [clickedLocation, path, name] );
        };
        
		if (!$('.overlay').hasClass('open')) {
			toggleOverlay();
		}
        
        $.get('http://api.webcams.travel/rest?method=wct.webcams.list_nearby&devid=92b442ab55694e87848d5e379a14011e&format=json&lat=' + clickedLocation.lat() + '&lng='+ clickedLocation.lng(), function(result) {
            result = $.parseJSON(result);
	    $('#largegallery').empty().append('<div id="slider" class="flexslider"><ul class="slides"></ul></div><div id="carousel" class="flexslider"><ul class="slides"></ul></div>');
	    
	       var ind = 0;
            result.webcams.webcam.forEach(function(webcam) {
            	console.log('d', webcam);
                var li = '<li><a onclick="openLargeGallery(' + (ind++)+')" ><img src="' + webcam.daylight_thumbnail_url + '"></a></li>';
                var m= '<li>';
                m += '<figure><a target="_blank" href="' + webcam.timelapse.link_day +'"><img src="' + webcam.preview_url + '"><figcaption>' + webcam.title + '</figcaption></a></figure>';
                m += '</li>';
                $('#slider .slides').append($(m));
            	$('#carousel .slides').append($('<li><img src="' + webcam.daylight_thumbnail_url + '"></li>'));
                $('.smallgallery .slides').append($(li));
                
            });
            if (!instagram_token) {
            	$('.smallgallery .slides').append($('<li>Se flere bilder?<br><a onclick="signinInstagram()"><img style="height:20px" src="images/Instagram_signin.png"</a></li>'));
            }
            $('.smallgallery .flexslider').flexslider({animation: "slide",
                    animationLoop: false,
                    itemWidth: 100,
                    itemMargin: 5,
                    controlNav: false
                    });
            $.get('php/instagram.php?token=' + instagram_token + '&type=search&lat=' + clickedLocation.lat() + '&lng='+ clickedLocation.lng(), function(result) {
                result = $.parseJSON(result);
                console.log('r', result);
                result.data.forEach(function(item) {
                    $.get('php/instagram.php?token=' + instagram_token + '&type=location-media&id=' + item.id, function(r) {
                        r = $.parseJSON(r);
                        console.log('r', r);
                        var addflex = false;
                        r.data.forEach(function(media) {
                            if (media.images) {
                                var d = new Date(media.created_time * 1000);
                                var title = d.toDateString();
                                title += ": " + media.location.name;
                                var li = '<li><a onclick="openLargeGallery(' + (ind++)+')"><img title="'+ title +'" src="' + media.images.thumbnail.url + '"></a></li>';
                                var m= '<li>';
                                m += '<figure><a target="_blank" href="' + media.link +'"><img src="' + media.images.standard_resolution.url + '"><figcaption>' + title + '</figcaption></a></figure>';
                                m += '</li>';
                                var img = '<li><img src="' + media.images.thumbnail.url + '"></li>';
                                if ($('#carousel').data('flexslider')) {
                                	$('#carousel').data('flexslider').addSlide($(img));
                                	$('#slider').data('flexslider').addSlide($(m));
                                } else {
                                	$('#slider .slides').append($(m));
                                	$('#carousel .slides').append($(img));
                                }
                                var flexslider = $('.smallgallery .flexslider')
                                if (flexslider.data('flexslider')) {
                                	flexslider.data('flexslider').addSlide($(li));
                                } else {
                                	addflex= true;
                                	flexslider.find('.slides').append($(li));
                                }
                           }
                        });
                        $('.smallgallery .flexslider').flexslider({animation: "slide",
                            animationLoop: false,
                            itemWidth: 100,
                            itemMargin: 5,
                            controlNav: false
                            });
                    });
                });
            });
        });
        
	

	});
  });
}

function openLargeGallery(ind) {
	$('#largegallery').modal();
	if (!$('#carousel').data('flexslider')) {
		 $('#carousel').flexslider({
	         animation: "slide",
	         controlNav: false,
	         animationLoop: false,
	         slideshow: false,
	         itemWidth: 100,
	         itemMargin: 5,
	         asNavFor: '#slider'
	       });
	      
	       $('#slider').flexslider({
	         animation: "slide",
	         controlNav: false,
	         animationLoop: false,
	         slideshow: false,
	         sync: "#carousel"
	       });
	}
       
       function gotoInd(slider, ind) {
    	   var animationSpeed = slider.vars.animationSpeed; 
    	   slider.vars.animationSpeed = 0;
    	   slider.flexAnimate(ind); 				
    	   slider.vars.animationSpeed = animationSpeed;
       }
       
       gotoInd($('#carousel').data('flexslider'), ind);
       gotoInd($('#slider').data('flexslider'), ind);
}

function addLargeContainer(clickedLocation, path, name) {
    var  img = '';
    img +='<div class=snocontainer>';
    img +=addSnoLayer(clickedLocation, 'swewk', 'Snø endring siste uke');
    img += addSnoLayer(clickedLocation, 'sd', 'Snødybde');
    img += addSnoLayer(clickedLocation, 'lwc', 'Snøtilstand');
    img += addSnoLayer(clickedLocation, 'sdfsw', 'Nysnødybde');
    img += '<div class="snodesc">*I dag -/+ 3 dager</div>';
    img +='</div>';
    img +='<div class=graphcontainer>';
    img +=  getRawImg('http://www.yr.no' + path + '/avansert_meteogram.png', 'Værvarsel '  + name, 'Data er hentet fra yr.no.');

    //img +=addMetChart("Nysnø siste 20 dager + 10 dagers varsel", clickedLocation, 'http://h-web01.nve.no/chartserver/ShowChart.aspx?req=getchart&ver=1.0&time={fromdate}T0000;{todate}T0000&chs={width}x{height}&lang=no&chlf=none&chsl=0;+0&chhl=2|0|2&timeo=-06:00&app=3d&chd=ds=hgts,da=29,id={pos};swewk,cht=col,mth=inst&nocache=0.7853575034532696', -10, 5, 700, 300);
    var bbox = getBbox(epsg32633, map.getBounds().getSouthWest(), map.getBounds().getNorthEast());
    bbox = bbox.replace(/,/g, '|');
    var senorgeUrl = 'http://www.senorge.no/?p=senorgeny&m=bmNVEGrey;MapLayer_swewk;&l=no&d=1433736000000&e=' + bbox + '&fh=0;2468';
    img +=addMetChart("Nedbør og temperatur siste 8 dager + 5 dagers varsel", clickedLocation, 'http://h-web01.nve.no/chartserver/ShowChart.aspx?req=getchart&ver=1.0&time={fromdate}T0000;{todate}T0000&chs={width}x{height}&lang=no&chlf=desc&chsl=0;+0&chhl=2|0|2&timeo=-06:00&app=3d&chd=ds=hgts,da=29,id={pos};fsw,cht=stckcol,mth=inst,clr=%233399FF|ds=hgts,da=29,id={pos};qsw,cht=stckcol,grp=1,mth=inst,clr=%23FF9933|ds=hgts,da=29,id={pos};qtt,cht=stckcol,grp=1,mth=inst,clr=red|ds=hgts,da=29,id={pos};tam,cht=line,mth=inst,drwd=3,clr=%23FF9933&nocache=0.2664557103998959', -8, 5, 700, 280, 'Data er hentet fra senorge.no. Se detaljer <a target="_blank"  href="'+ senorgeUrl+'">her</a>');
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
    html +='<br><a target="_blank"  href="https://www.youtube.com/results?search_query=' + name +'">youtube.com</a>';
    html +='<br><a target="_blank"  href="https://vimeo.com/search?q=' + name +'">vimeo.com</a>';
    html +='<br><a target="_blank"  href="http://www.gramfeed.com/instagram/map#/' + clickedLocation.lat() +',' + clickedLocation.lng() + '/1000/-">gramfeed.com</a>';
    
    
    html +='<br><br>Lenker:';
    html +='<br><a target="_blank"  href="http://www.varsom.no">varsom.no</a>';
    html +='<br><a target="_blank"  href="http://sjogg.no">sjogg.no</a>';
    html +='<br><a target="_blank"  href="http://randopedia.net">randopedia.no</a>';
    
    
    html += '</div>';
    return html;
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
	name = name + ' <span id="info_' + layer + '"></span>';
	var result = getImg(
			latLng,
			'http://gridwms.nve.no/WMS_server/wms_server.aspx?time='
					+ date
					+ '&custRefresh=0.1345073445700109&SERVICE=WMS&REQUEST=GetMap&FORMAT=image/png&TRANSPARENT=TRUE&STYLES=&VERSION=1.1.1&LAYERS='
					+ layer + '&SRS=EPSG:32633&BBOX=', latLng, name);
	$.get('php/fetch.php?type=nve&x=' + p[0] + '&y=' + p[1] + '&layer=' + layer
			+ '&startdate=' + startdate + '&enddate=' + enddate, function(
			result) {
		result = $.parseJSON(result);
		console.log(result);

		var pre = Math.round(result.MapGridValue[0] + result.MapGridValue[1]
				+ result.MapGridValue[2]);
		var post = Math.round(result.MapGridValue[4] + result.MapGridValue[5]
				+ result.MapGridValue[6]);
		if (layer == 'sd' || layer == 'lwc') {
			pre = Math.round(pre / 3);
			post = Math.round(post / 3);
		}
		if (layer == 'swewk') {
			$('#info_' + layer).html(
					'(' + result.MapGridValue[3] + ' ' + result.Unit + ')');
		} else {
			$('#info_' + layer).html(
					'(' + result.MapGridValue[3] + ' ' + result.Unit + ', '
							+ pre + ' ' + result.Unit + ' / ' + post + ' '
							+ result.Unit + ')');
		}
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
	$('.overlay-less').hide();
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
  ui.appendChild(addLayer('snodybde', 'Snødybde')); 
  ui.appendChild(addLayer('bratthet', 'Bratthet'));
  ui.appendChild(addLayer('skog', 'Under skoggrense'));
  ui.appendChild(addLayer('webcam', 'Webkamera'));
  ui.appendChild(addLayer('none', 'Ingen')); 
  controlUI.appendChild(ui);
}

function addLayer(layerId, name, active ) {
	var li = document.createElement('ul');
	li.className = 'layer ' + layerId;
	if (active) {
		li.className += ' active ';
	}
	li.innerHTML = name;
	google.maps.event.addDomListener(li, 'click', function() {
		activateLayer(layerId);
	});
	return li;
}

function activateLayer(layerId) {
	map.overlayMapTypes.clear();
	$('.active').removeClass('active');
	$('.' + layerId).addClass('active');
	webcamstravel.easymap.unload();
	if (layerId == 'clouds_precipitation_regional') {
		addYrLayer('clouds_precipitation_regional');
	} else if (layerId == 'radar_precipitation_intensity') {
		addYrLayer('radar_precipitation_intensity');
	} else if (layerId == 'temperature_2m_regional') {
		addYrLayer('temperature_2m_regional');
	} else if (layerId == 'wind_10m_regional') {
		addYrLayer('wind_10m_regional');

	} else if (layerId == 'snodybde') {
		loadWMS(map, 'http://gis.nve.no/ArcGIS/rest/services/Mapservices/seNorge_SQL/MapServer/export?dpi=96&transparent=true&format=png8&layers=show%3A39&time=1433714400000%2C1433800799000&bboxSR=3857&imageSR=3857&size=1024%2C1024&f=image&', {
			tileWidth : 1024,
			tileHeight : 1024,
			opacity : 1
			});
	} else if (layerId == 'bratthet') {			
	    loadWMS(map, 'http://gis.nve.no/ArcGIS/rest/services/Mapservices/Bakgrunnsdata/MapServer/export?dpi=96&transparent=true&format=png8' 
	              + '&layers=show%3A52%2C53%2C54&bboxSR=3857&imageSR=3857&size=1024%2C1024&f=image&', {
	        tileWidth : 1024,
	        tileHeight : 1024,
	        opacity : 0.5
	    });
	} else if (layerId == 'skog') {			
	    loadWMS(map, 'http://gislaugny.nve.no/ArcGIS/rest/services/Mapservices/seNorge_SQL/MapServer/export?dpi=96&transparent=true&format=png8&layers=show:29,30&time=1433714400000,1433800799000&bboxSR=3857&imageSR=3857&size=1024,1024&f=image', {
	        tileWidth : 1024,
	        tileHeight : 1024,
	        opacity : 0.5
	    });
	} else if (layerId == 'webcam') {
		webcamstravel.easymap.load(map);
	}
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
		$('.overlay-less').show();
		$('.zoom figure').parent().bind('transitionend', function() {
			$('#zoomcontainer').hide();
		});
		$('#overlaycontent').removeClass('open').fadeIn();
		return;
	}
    var transEndEventName = 'transitionend';
    if( $('.overlay').hasClass( 'open' ) ) {
        $('.overlay').removeClass( 'open' );
        $('.controlpanel').removeClass( 'open' );
        $('.controlpanel').addClass( 'close' );
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

function setCookie(cname,cvalue,exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires=" + d.toGMTString();
    document.cookie = cname+"="+cvalue+"; "+expires;
}

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i=0; i<ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1);
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return null;
}

function signinInstagram() {	
	var port = location.port;
	if (port) {
		port = ':' + port;
	}
	var redirecturl = location.protocol + '//'  + location.hostname + port + location.pathname;
	location.href = 'https://instagram.com/oauth/authorize/?client_id=b0d3f27f19c84e8f9de3db70ab464ee4&redirect_uri=' + redirecturl + '&response_type=token'
}

function addruler() {
	var projection = map.getProjection();
	
	var pos = projection.fromLatLngToPoint(map.getCenter());
	console.log('pos', pos);
	var scale = Math.pow(2,map.getZoom());
	var latlng1 = map.getProjection().fromPointToLatLng(new google.maps.Point( ((pos.x*scale) - 100) /scale,pos.y));
	var latlng2 = map.getProjection().fromPointToLatLng(new google.maps.Point( ((pos.x*scale) + 100) /scale,pos.y));
    ruler1 = new google.maps.Marker({
        position: latlng1,
        map: map,
        draggable: true,
        icon: {scale: 5, anchor : new google.maps.Point(0,0), path: google.maps.SymbolPath.CIRCLE }
    });
 
    ruler2 = new google.maps.Marker({
        position: map.getCenter() ,
        map: map,
        draggable: true,
        icon: {scale: 5, anchor : new google.maps.Point(0,0), path: google.maps.SymbolPath.CIRCLE } 
    });
    ruler2.setTitle('Dra og slipp')
    ruler1.setTitle('Dra og slipp')
     
    var ruler1label = new Label({ map: map, ruler1:ruler1, ruler2: ruler2  });
    ruler1label.bindTo('position', ruler1, 'position');
 
    rulerpoly = new google.maps.Polyline({
        path: [ruler1.position, ruler2.position] ,
        //strokeColor: "#FFFF00",
        xicons: [{
            icon: {
                path: "M0 556.41c0 46.398 4.34 88.38 13.022 125.934 8.678 37.554 20.696 70.184 36.052 97.892s34.884 52.078 58.586 73.108c23.7 21.032 49.406 38.224 77.112 51.576 27.706 13.35 59.336 24.198 94.888 32.546 35.552 8.346 71.856 14.188 108.91 17.528 37.054 3.338 77.78 5.006 122.178 5.006 44.732 0 85.628-1.668 122.68-5.006 37.054-3.34 73.442-9.184 109.16-17.528s67.512-19.192 95.388-32.546c27.876-13.354 53.746-30.544 77.616-51.576 23.87-21.030 43.566-45.404 59.086-73.108s27.622-60.336 36.302-97.892c8.68-37.556 13.020-79.536 13.020-125.934 0-82.788-27.708-154.394-83.118-214.816 3.004-8.012 5.758-17.108 8.262-27.29s4.84-24.702 7.010-43.564c2.17-18.862 1.336-40.642-2.504-65.346-3.838-24.704-10.932-49.906-21.284-75.612l-7.51-1.502c-5.342-1-14.106-0.75-26.29 0.752s-26.372 4.506-42.562 9.014c-16.19 4.506-37.054 13.186-62.592 26.038s-52.494 28.958-80.87 48.32c-48.736-13.352-115.668-20.030-200.792-20.030-84.792 0-151.556 6.678-200.294 20.030-28.376-19.362-55.5-35.468-81.37-48.32s-46.484-21.532-61.84-26.038c-15.354-4.508-29.71-7.428-43.062-8.764-13.354-1.336-21.784-1.752-25.288-1.252s-6.26 1.086-8.262 1.752c-10.348 25.706-17.442 50.906-21.28 75.612-3.838 24.704-4.674 46.486-2.504 65.346s4.508 33.382 7.010 43.564c2.504 10.182 5.258 19.278 8.262 27.29-55.414 60.422-83.122 132.026-83.122 214.816zM125.684 682.094c0-48.070 21.866-92.136 65.596-132.194 13.018-12.020 28.208-21.114 45.566-27.292 17.358-6.176 36.97-9.68 58.836-10.516 21.866-0.834 42.812-0.668 62.842 0.502 20.028 1.168 44.732 2.754 74.108 4.756 29.376 2.004 54.748 3.004 76.112 3.004 21.366 0 46.736-1 76.112-3.004 29.378-2.002 54.078-3.588 74.11-4.756 20.030-1.17 40.974-1.336 62.842-0.502 21.866 0.836 41.476 4.34 58.838 10.516 17.356 6.176 32.544 15.27 45.564 27.292 43.73 39.394 65.598 83.456 65.598 132.194 0 28.712-3.59 54.162-10.768 76.364-7.178 22.2-16.358 40.81-27.542 55.83s-26.704 27.79-46.568 38.306c-19.862 10.516-39.222 18.61-58.084 24.288-18.862 5.674-43.066 10.098-72.608 13.27-29.546 3.172-55.916 5.092-79.118 5.758-23.2 0.668-52.66 1.002-88.378 1.002s-65.178-0.334-88.378-1.002c-23.2-0.666-49.574-2.586-79.116-5.758s-53.744-7.596-72.606-13.27c-18.86-5.678-38.222-13.774-58.084-24.288s-35.386-23.282-46.568-38.306c-11.182-15.022-20.364-33.63-27.54-55.83-7.178-22.202-10.766-47.656-10.766-76.364zM640 672c0-53.019 28.654-96 64-96s64 42.981 64 96c0 53.019-28.654 96-64 96s-64-42.981-64-96zM256 672c0-53.019 28.654-96 64-96s64 42.981 64 96c0 53.019-28.654 96-64 96s-64-42.981-64-96z"
            },
            offset: '50%'
          }],
        draggable: false,
        strokeOpacity: 1,
        strokeWeight: 1
    });
    rulerpoly.setMap(map);
    var  elevationfn =function() {
    	elevator.getElevationAlongPath({
    	    'path': [ruler1.getPosition(), ruler2.getPosition()],
    	    'samples': 2
    	  }, function(results, status) {
    		  if (status != google.maps.ElevationStatus.OK) {
    			    return;
    		  }
    		  var elevation = results[0].elevation - results[1].elevation;
    		  if (elevation < 0) {
    			  elevation = elevation *-1;
    		  }
    		  var dist = google.maps.geometry.spherical.computeDistanceBetween(results[0].location, results[1].location);
    		  var steepnes = elevation / dist;
    		  var deg = Math.atan(steepnes) * (180/Math.PI);
    		  ruler1label.set('text', Math.round(dist) +  'm (Høydeforskjell: ' + Math.round(elevation) + 'm, ' + Math.round(deg) + ' grader helning)');
    	  });
    };
    elevationfn();
    google.maps.event.addListener(ruler1, 'dragend', elevationfn );
    google.maps.event.addListener(ruler2, 'dragend', elevationfn );
    
    google.maps.event.addListener(ruler1, 'drag', function() {
        rulerpoly.setPath([ruler1.getPosition(), ruler2.getPosition()]);
        //ruler1label.set('text',distance( ruler1.getPosition(), ruler2.getPosition()));
    });
    google.maps.event.addListener(ruler2, 'drag', function() {
        rulerpoly.setPath([ruler1.getPosition(), ruler2.getPosition()]);
        //ruler1label.set('text',distance( ruler1.getPosition(), ruler2.getPosition()));
    });
 
}

function distance(lat1,lat2) {
	var d = google.maps.geometry.spherical.computeDistanceBetween(lat1, lat2);
	var result =  Math.round(d) + "m <span id='steepnes'></span>"; 
	return result;
}

//Define the overlay, derived from google.maps.OverlayView
function Label(opt_options) {
	// Initialization
	this.setValues(opt_options);

	// Label specific
	var span = this.span_ = document.createElement('span');
	span.className = 'label';

	var div = this.div_ = document.createElement('div');
	div.appendChild(span);
	div.style.cssText = 'position: absolute; display: none';
};
Label.prototype = new google.maps.OverlayView;

// Implement onAdd
Label.prototype.onAdd = function() {
	var pane = this.getPanes().overlayLayer;
	pane.appendChild(this.div_);

	
	// Ensures the label is redrawn if the text or position is changed.
	var me = this;
	this.listeners_ = [
		google.maps.event.addListener(this, 'position_changed',
		function() { me.draw(); }),
		google.maps.event.addListener(this, 'text_changed',
		function() { me.draw(); })
	];
	
};

// Implement onRemove
Label.prototype.onRemove = function() { this.div_.parentNode.removeChild(this.div_ );
	// Label is removed from the map, stop updating its position/text.
	for (var i = 0, I = this.listeners_.length; i < I; ++i) {
		google.maps.event.removeListener(this.listeners_[i]);
	}
};

function getAngleFromPoint(firstPoint, secondPoint) {
    if((secondPoint.x > firstPoint.x)) {//above 0 to 180 degrees
        return (Math.atan2((secondPoint.x - firstPoint.x), (firstPoint.y - secondPoint.y)) * 180 / Math.PI);
    }
    else if((secondPoint.x < firstPoint.x)) {//above 180 degrees to 360/0
        return 360 - (Math.atan2((firstPoint.x - secondPoint.x), (firstPoint.y - secondPoint.y)) * 180 / Math.PI);
    }//End if((secondPoint.x > firstPoint.x) && (secondPoint.y <= firstPoint.y))
    return Math.atan2(0 ,0);
}

// Implement draw
Label.prototype.draw = function() {
	var projection = this.getProjection();
	var pos1 = this.ruler1.getPosition();
	var pos2 = this.ruler2.getPosition();
	if (pos1.lng() > pos2.lng()) {
		var t = pos1;
		pos1 = pos2;
		pos2 = t;
	}
	var latlng = new google.maps.LatLngBounds(pos1, pos2).getCenter();
	//console.log('latlng', latlng);
	
	var firstpoint = projection.fromLatLngToDivPixel(pos1);
	var secondpoint = projection.fromLatLngToDivPixel(pos2);
	
	var position = projection.fromLatLngToDivPixel(latlng);

	var div = this.div_;
	div.style.left = position.x + 'px';
	div.style.top = position.y + 'px';
	div.style.display = 'block';
	var deg = (90 - Math.round(getAngleFromPoint(firstpoint, secondpoint)))*-1;
	div.style.transform= 'rotate(' + deg+'deg)';
	//div.style.transform= 'rotate(45deg)';

	this.span_.innerHTML = this.get('text').toString();
};
