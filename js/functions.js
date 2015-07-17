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
                m += '<figure><a target="_blank" href="' + webcam.timelapse.link_day +'"><img src="' + webcam.preview_url + '"><figcaption>' + webcam.title + '</a></figcaption></figure>';
                m += '</li>';
                $('#slider .slides').append($(m));
            	$('#carousel .slides').append($(m));
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
                                var li = '<li><a onclick="openLargeGallery(' + (ind++)+')"><img title="'+ title +'" src="' + media.images.standard_resolution.url + '"></a></li>';
                                var m= '<li>';
                                m += '<figure><a target="_blank" href="' + media.link +'"><img src="' + media.images.standard_resolution.url + '"><figcaption>' + title + '</a></figcaption></figure>';
                                m += '</li>';
                                if ($('#carousel').data('flexslider')) {
                                	$('#carousel').data('flexslider').addSlide($(m));
                                	$('#slider').data('flexslider').addSlide($(m));
                                } else {
                                	$('#slider .slides').append($(m));
                                	$('#carousel .slides').append($(m));
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
    html +='<br><a target="_blank"  href="http://www.webcams.travel/map/#lat='+ clickedLocation.lat() +'&lng=' + clickedLocation.lng()+'&z=' + map.getZoom() +'&t=n">www.webcams.travel</a>';
    html +='<br><a target="_blank"  href="http://youtube.github.io/geo-search-tool/search.html?q=&la='+ clickedLocation.lat() +'&lo=' + clickedLocation.lng()+'&lr=10km&tw=any&cl=&sl='+ clickedLocation.lat() +  '%20' + clickedLocation.lng()+ '&eo=false&loo=false&cco=false&zl=11&pbt=2015-06-19T17:46:11Z">youtube.com</a>';
    html +='<br><a target="_blank"  href="http://www.gramfeed.com/instagram/map#/' + clickedLocation.lat() +',' + clickedLocation.lng() + '/1000/-">instagram.com</a>';
    
    
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
	 
    ruler1 = new google.maps.Marker({
        position: map.getCenter() ,
        map: map,
        draggable: true
    });
 
    ruler2 = new google.maps.Marker({
        position: map.getCenter() ,
        map: map,
        draggable: true
    });
    ruler2.setTitle('hello')
     
    var ruler1label = new Label({ map: map });
    var ruler2label = new Label({ map: map });
    ruler1label.bindTo('position', ruler1, 'position');
    ruler2label.bindTo('position', ruler2, 'position');
 
    rulerpoly = new google.maps.Polyline({
        path: [ruler1.position, ruler2.position] ,
        //strokeColor: "#FFFF00",
        strokeOpacity: .7,
        strokeWeight: 2
    });
    rulerpoly.setMap(map);
 
    ruler1label.set('text',"0m");
    ruler2label.set('text',"0m");
 
    google.maps.event.addListener(ruler1, 'drag', function() {
        rulerpoly.setPath([ruler1.getPosition(), ruler2.getPosition()]);
        ruler1label.set('text',distance( ruler1.getPosition(), ruler2.getPosition()));
        ruler2label.set('text',distance( ruler1.getPosition(), ruler2.getPosition()));
    });
 
    google.maps.event.addListener(ruler2, 'drag', function() {
        rulerpoly.setPath([ruler1.getPosition(), ruler2.getPosition()]);
        ruler1label.set('text',distance( ruler1.getPosition(), ruler2.getPosition()));
        ruler2label.set('text',distance( ruler1.getPosition(), ruler2.getPosition()));

    });
 
}

function distance(lat1,lat2) {
	var d = google.maps.geometry.spherical.computeDistanceBetween(lat1, lat2);
	return Math.round(d) + "m";
	/*
    var R = 6371; // km (change this constant to get miles)
    var dLat = (lat2-lat1) * Math.PI / 180;
    var dLon = (lon2-lon1) * Math.PI / 180; 
    var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180 ) * Math.cos(lat2 * Math.PI / 180 ) * 
        Math.sin(dLon/2) * Math.sin(dLon/2); 
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    var d = R * c;
    if (d>1) return Math.round(d)+"km";
    else if (d<=1) return Math.round(d*1000)+"m";
    return d;
    */
}

//Define the overlay, derived from google.maps.OverlayView
function Label(opt_options) {
	// Initialization
	this.setValues(opt_options);

	// Label specific
	var span = this.span_ = document.createElement('span');
	span.style.cssText = 'position: relative; left: 8px;; top: -8px; ' +
			  'white-space: nowrap; border: 0px; font-family:arial; font-weight:bold;' +
			  'padding: 2px; xbackground-color: #ddd; '+
				'opacity: 1; '+
				'filter: alpha(opacity=75); ';

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

// Implement draw
Label.prototype.draw = function() {
	var projection = this.getProjection();
	var position = projection.fromLatLngToDivPixel(this.get('position'));

	var div = this.div_;
	div.style.left = position.x + 'px';
	div.style.top = position.y + 'px';
	div.style.display = 'block';

	this.span_.innerHTML = this.get('text').toString();
};