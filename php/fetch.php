<?php
$lat = $_GET['lat'];
$lon = $_GET['lon'];
$url = "http://www.yr.no/_/websvc/latlon2p.aspx?lat={$lat}&lon=${lon}&spr=nob";
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
