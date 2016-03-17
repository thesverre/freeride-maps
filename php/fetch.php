<?php

$type = $_GET['type'];
if ($type == "varsom") {
  $lat = $_GET['lat'];
  $lon = $_GET['lon']; 
  $startdate = $_GET['startdate'];
  $enddate = $_GET['enddate'];
  $url = "http://api01.nve.no/hydrology/forecast/avalanche/v2.0.2/api/AvalancheWarningByCoordinates/Detail/{$lat}/{$lon}/1/{$startdate}/{$enddate}";
} else if ($type == "randopedia") {
  $url = 'http://randopedia.net/randopedia/api/tourItems';
} else if ($type == "yr") {
        $position = $_GET['position'];
	$url = "http://www.yr.no/{$position}/varsel.xml";
} else if ($type == "yr_position") {
	$lat = round($_GET['lat'], 4);
	$lon = round($_GET['lon'], 4); 
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
if ($type == "varsom") {
 curl_setopt($curl, CURLOPT_HTTPHEADERS, array('Content-Type: application/json'));
}
// Send the request & save response to $resp
$resp = curl_exec($curl);
curl_close($curl);
echo $resp;

?>

