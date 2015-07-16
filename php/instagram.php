<?php

function generate_sig($endpoint, $params, $secret) {
  $sig = $endpoint;
  ksort($params);
  foreach ($params as $key => $val) {
    $sig .= "|$key=$val";
  }
  return hash_hmac('sha256', $sig, $secret, false);
}

function get($endpoint, $params) {
  $secret = 'be99396bcb5c416b8f52a5a5524c4b73';
  $fields_string = "";
  foreach($params as $key=>$value) { 
	$fields_string .= $key.'='.$value.'&'; 
  }
  rtrim($fields_string, '&');
  $url = "https://api.instagram.com/v1{$endpoint}?$fields_string";  
  
  $sig = generate_sig($endpoint, $params, $secret);
  $url .="&sig={$sig}";
  
  $curl = curl_init();
  curl_setopt_array($curl, array(
    CURLOPT_RETURNTRANSFER => 1,
    CURLOPT_URL => $url
  ));
   // Send the request & save response to $resp
  $resp = curl_exec($curl);
   curl_close($curl);

  return $resp;
}



$type = $_GET['type'];  
$access_token = $_GET['token'];

$secret = 'be99396bcb5c416b8f52a5a5524c4b73';
if ($type == "search") {
  $lat = $_GET['lat'];
  $lng = $_GET['lng'];
  $endpoint = "/locations/search";
  $params = array(
	  'lat' => $lat,
	  'lng' => $lng,
	  'access_token' => $access_token,
  );
  $resp = get($endpoint, $params);
  echo $resp;
} 
if ($type == "location-media") {
  $params = array(
    'access_token' => $access_token,
  );
  $id = $_GET['id'];
  $endpoint = "/locations/{$id}/media/recent";
  $resp = get($endpoint, $params);
  echo $resp;
}
/*
$json_a = json_decode($resp, true);

echo  "[";
$c = 0;
foreach ($json_a['data'] as $place){
  if ($c > 0) {
	echo ",";
  }
  $c = $c + 1;
  echo  "{ \"lat\" :  \"{$place['latitude']}\",";
  echo  "\"lng\" :  \"{$place['latitude']}\",";
  echo  "\"id\" :  \"{$place['id']}\",";
  $str = getLocationMedia($place['id'], $secret, $access_token);
  echo  "\"data\" : $str,";
  echo  "}";
  if (c == 2) {
    break;
  }
}
echo "]";
*/
?>


