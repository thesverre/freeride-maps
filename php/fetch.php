<?php

$type = $_GET['type'];
if ($type == "yr") {
	$lat = $_GET['lat'];
	$lon = $_GET['lon']; 
	$url = "http://www.yr.no/_/websvc/latlon2p.aspx?lat={$lat}&lon=${lon}&spr=nob";
} else {
	$x = $_GET['x'];
	$y = $_GET['y'];
	$layer = $_GET['layer'];
	$startdate = $_GET['startdate'];
	$enddate = $_GET['enddate'];
	$url = "http://h-web01.nve.no/seNorgeMapAppServices/Services/UIService.svc/GetMapGridInfo?request=%7B%22x%22:{$x},%22y%22:{$y},%22id%22:%22{$layer}%22,%22startDateTime%22:%22{$startdate}%22,%22endDateTime%22:%22{$enddate}%22%7D";
}
$curl = curl_init();
// Set some options - we are passing in a useragent too here
curl_setopt_array($curl, array(
    CURLOPT_RETURNTRANSFER => 1,
    CURLOPT_URL => $url,
    CURLOPT_USERAGENT => 'cURL Request'
));
// Send the request & save response to $resp
$resp = curl_exec($curl);
curl_close($curl);
echo $resp;

?>
