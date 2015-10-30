
proj4.defs('EPSG:32633','+proj=utm +zone=33 +ellps=WGS84 +datum=WGS84 +units=m +no_defs');
proj4.defs('EPSG:3857', '+proj=merc +lon_0=0 +k=1 +x_0=0 +y_0=0 +a=6378137 +b=6378137 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs');
var epsg3857 = proj4('EPSG:3857');
var epsg32633 = proj4('EPSG:32633');

var map;
var geocoder;
var marker;
var instagram_token;
var elevator;
var embedded = location.href.indexOf('embedded=true')> 0;
google.load('visualization', '1', {packages: ['columnchart']});
function initializeMap() {
	
    var hash = location.hash;
    var zoom = 6;
    var center = new google.maps.LatLng(60.884256,8.646952);
    instagram_token = getCookie('instagram_token');
    if (hash) {
        if (hash.startsWith("#access_token=")) {
            instagram_token = hash.substring("access_token=".length + 1)
            setCookie('instagram_token', instagram_token, 1000);
        }
        var a = hash.substring(1).split(',');
        if (a.length == 3) {
            zoom = parseInt(a[0]);
            center = new google.maps.LatLng(parseFloat(a[1]), parseFloat(a[2]));
            console.log('c', center);
        }
        

    }
    geocoder = new google.maps.Geocoder();
    var smallwidth = $( document ).width() < 600;
    var mapOptions = {
        zoom : zoom,
        center : center,
        rotateControl : true,
        scaleControl : false,
        panControl : false,
        zoomControl : false,
        mapTypeId : 'mix',
        mapTypeControl : true,
        mapTypeControlOptions : {
        	position: smallwidth ? google.maps.ControlPosition.RIGHT_TOP : google.maps.ControlPosition.BOTTOM_LEFT,
            mapTypeIds : [ 'mix', google.maps.MapTypeId.TERRAIN,
                    'statkart_topo2', 'statkart_raster', 'ut', 'eniro_aerial',
                    google.maps.MapTypeId.HYBRID ],
            style : smallwidth ? google.maps.MapTypeControlStyle.DROPDOWN_MENU : google.maps.MapTypeControlStyle.HORIZONTAL
        }
    };
    map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
    
    
    elevator = new google.maps.ElevationService();

    function createMapType(inType, layer, name) {
        return new google.maps.ImageMapType(
                {
                    getTileUrl : function(coord, zoom) {
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
                        	return 'temp/' + zoom + '/' + coord.x  + '/' +  coord.y + '.png'; 
                            return 'http://opencache.statkart.no/gatekeeper/gk/gk.open_gmaps?layers='
                                    + l
                                    + '&zoom='
                                    + zoom
                                    + '&x='
                                    + coord.x
                                    + '&y=' + coord.y;
                        } else if (type == 'eniro') {
                            var y = coord.y;
                            var y = Math.pow(2, zoom) - y - 1;
                            return 'http://map01.eniro.no/geowebcache/service/tms1.0.0/aerial/'
                                    + zoom + '/' + coord.x + '/' + y + '.jpeg';
                        } else if (type == 'google') {
                            return 'http://mt0.google.com/vt/v=w2p.106&hl=en&x='
                                    + coord.x + '&y=' + coord.y + '&z=' + zoom;
                        } else if (type == 'ut') {
                            return 'https://b-kartcache.nrk.no/tiles/ut_topo_light/'
                                    + zoom
                                    + '/'
                                    + coord.x
                                    + '/'
                                    + coord.y
                                    + '.jpg';
                        }
                    },
                    tileSize : new google.maps.Size(256, 256),
                    opacity : 1,
                    isPng : true,
                    minZoom : 5,
                    maxZoom : 20,
                    name : name
                });

    }
    map.mapTypes.set('mix', createMapType('mix', 'topo2', 'Miks'));
    map.mapTypes.set('statkart_topo2', createMapType('sk', 'topo2',
            'Statkart topograkrafisk'));
    map.mapTypes.set('statkart_raster', createMapType('sk', 'toporaster3',
            'Statkart Raster'));
    map.mapTypes.set('eniro_aerial', createMapType('eniro', 'aearial',
            'Eniro Flyfoto'));
    map.mapTypes.set('ut', createMapType('ut', 'ut', 'Ut.no'));

    var input = (document.getElementById('pac-input'));

    var searchBox = new google.maps.places.SearchBox(input);
    input.index = 1;
    //map.controls[google.maps.ControlPosition.LEFT_TOP].push(input);

    var controlPanelContainer = document.createElement('div');
    controlPanelContainer.className = 'controlpanelContainer open';
    controlPanelContainer.appendChild(input);
    var controlPanelDiv = document.createElement('div');
    controlPanelDiv.id = 'controlPanel';
    var controlPanel = new ControlPanel(controlPanelDiv, map);
    controlPanelContainer.appendChild(controlPanelDiv);
    var d = document.createElement('div')
    d.innerHTML = '<img onclick="showLayer()" style="margin-left: 12px" src ="images/layers_2.png" width="24px">';
    d.className = 'controlpanelicon';
    controlPanelContainer.appendChild(d);
    controlPanelContainer.index = 3;
    map.controls[google.maps.ControlPosition.LEFT_TOP]
            .push(controlPanelContainer);

    var div = document.createElement('div');
    div.id = 'contentInfo';
    div.index = 2;
    map.controls[google.maps.ControlPosition.LEFT_TOP].push(div);

    if (!embedded) {
	    var div = document.createElement('div');
	    div.className = 'geolocation';
	    div.innerHTML = '<img src="images/geolocation.png" title="Min posisjon" width="24px">';
	    $(div).click(getMyPosition);
	    
	    map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(div);
	
	    
	    var div = document.createElement('div');
	    div.className = 'measurement';
	    div.innerHTML = '<img src="images/measurement.png" title="Mål distanse" width="24px">';
	    $(div).click(
	            function() {
	                addruler();
	
	            });
	    map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(div);
    }    
    
    var norgeskartBounds = new google.maps.LatLngBounds(new google.maps.LatLng(
            57.5, 3), new google.maps.LatLng(71, 31.5));

    google.maps.event.addListener(map, 'maptypeid_changed', function() {
        if (map.getMapTypeId() == 'statkart_topo2'
                || map.getMapTypeId() == 'statkart_raster'
                || map.getMapTypeId() == 'mix') {
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
        var m = document.getElementById('map-canvas');
        var w = m.offsetWidth;
        var h = m.offsetHeight;
        var y = (h - 100) - event.pixel.y;
        var x = Math.round(w / 2) - event.pixel.x;
        x = x * -1;
        y = y * -1;

        // map.panBy(x, y);
    });

    var closeBttn = $('.overlay-close');
    closeBttn.click(toggleOverlay);
    var loaded = false;
    google.maps.event.addListener(map, 'tilesloaded', function(event) {
        if (!loaded) {
            if (document.getElementById('map-canvas').offsetWidth > 1200) {
                showLayer();
            }
            activateLayer('randopedia');
            loaded = true;
        }
    });

    var moreBttn = $('.overlay-more');
    moreBttn.click(function() {
        if ($('.overlay').hasClass('overlay-expanded')) {
            $(this).removeClass('overlay-less').addClass('overlay-more');
            $('.overlay').removeClass('overlay-expanded');
            $('.overlay').addClass('overlay-collapse');
            $('.largecontainer').fadeOut();
        } else {
            $(this).addClass('overlay-less').removeClass('overlay-more');
            $('.overlay').removeClass('overlay-collapse').addClass(
                    'overlay-expanded');
            var data = $('.largecontainer').data('data');
            var html = addLargeContainer(data[0], data[1], data[2]);
            $('.largecontainer').html(html).fadeIn();

        }
    });

    var markers = [];
    google.maps.event.addListener(map, 'bounds_changed', function() {
        var bounds = map.getBounds();
        searchBox.setBounds(bounds);
        //location.href = location.pathname + "#" + map.getZoom() + ',' + map.getCenter().toUrlValue();
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
            var m = document.getElementById('map-canvas');
            var h = m.offsetHeight;
            var y = (h - 100) - Math.round(m.offsetHeight / 2);
            y = y * -1;

            map.panBy(0, y);

            setOnclickMarker(places[0].geometry.location);
            onClickMap(places[0].geometry.location, places[0].name);
            return;
        }
        // For each place, get the icon, place name, and location.
        markers = [];
        var bounds = new google.maps.LatLngBounds();
        for (var i = 0, place; place = places[i]; i++) {
            var image = {
                url : place.icon,
                size : new google.maps.Size(71, 71),
                origin : new google.maps.Point(0, 0),
                anchor : new google.maps.Point(17, 34),
                scaledSize : new google.maps.Size(25, 25)
            };

            // Create a marker for each place.
            marker = new google.maps.Marker({
                map : map,
                icon : image,
                title : place.name,
                clickable : true,
                position : place.geometry.location
            });

            markers.push(marker);

            bounds.extend(place.geometry.location);
        }
        map.fitBounds(bounds);

    });
    var initpos = center;
    setOnclickMarker(initpos);
    onClickMap(initpos, null, true);
    
    window.addEventListener('popstate', function(event) {
    	console.log('d', event);
    	var pos;
    	if (!event.state) {
    		pos = initpos;
    	} else {
    		pos = new google.maps.LatLng(event.state.lat, event.state.lng);
    	}
    	setOnclickMarker(pos);
        onClickMap(pos, null, true);
    });
}

