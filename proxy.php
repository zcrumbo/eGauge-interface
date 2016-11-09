<?php
header('Content-Type: application/json');
//****************API Documentation: https://www.egauge.net/docs/egauge-xml-api.pdf****************

if (count($_POST) == 0) {
  //exit;
};
date_default_timezone_set('America/Los_Angeles');
$firstURL = "http://egauge16844.egaug.es/57A4C/cgi-bin/egauge?tot&inst"; //returns totals of power generated and used, plus instantaneous wattage generated and used;
$baseURL = "http://egauge16844.egaug.es/57A4C/cgi-bin/egauge-show?";//for interval data
$start = $_POST["start"] ? : date("U", strtotime("-1 Day"));//default value is 1 day ago
$end = $_POST["end"] ? : date(U); //default value is now
$interval = $_POST["interval"] ? : "h";//default interval is 1 hour if not set by form
$intervalData = new SimpleXMLElement(file_get_contents($baseURL.$interval."&t=".$start."&f=".$end)); 
$prettyDate = "F j, Y, g:i a";
$baseData = new SimpleXMLElement(file_get_contents($firstURL));
$lastInterval = count($intervalData->data->r)-1;
//get total and instantaneous power
foreach($baseData->r as $row){
	switch($row['n']){
		case 'Total Generation':
			$totalMade = ((int) $row->v)/3600000; //power is given in joules, needs to be converted to kWh
			$instantMade = (int) $row->i;
			break;
		case 'Total Usage':
			$totalUsed = ((int) $row->v)/3600000;
			$instantUsed = (int) $row->i;
			break;
	}
}

$index = 0;
foreach($intervalData->data->cname as $register){
	switch($register){//get index value for grid and solar columns
		case 'Grid':
			$gridColumn = $index;
		case 'Solar':
			$solarColumn = $index;
	}
	$index++;
}
//get usage and generation values for specified time period
$gridStart = (int)$intervalData->data->r[0]->c[$gridColumn];
$gridEnd = (int)$intervalData->data->r[$lastInterval]->c[$gridColumn];
$solarStart = (int)$intervalData->data->r[0]->c[$solarColumn];
$solarEnd = (int)$intervalData->data->r[$lastInterval]->c[$solarColumn];

$totalGridInt = ($gridStart-$gridEnd)/3600000;
$totalSolarInt = ($solarStart-$solarEnd)/3600000;
$totalPowerInt = ($totalGridInt+$totalSolarInt);

//echo(($totalGridInt)."\n".($totalSolarInt)."\n".$totalPowerInt."\n");

$json_array=array(
	"requestRange"=>array("from" => date($prettyDate, $start), "to"=>date($prettyDate, $end)),
	"beginDate"=>(string)$intervalData->data->attributes()['epoch'],
	"fromBeginning" => array("generation" => $totalMade, "consumption" => $totalUsed),
	"instant" => array("generation" => $instantMade, "consumption" => $instantUsed),
	"intervalTotals" => array("consumed"=>$totalPowerInt, "generated"=>$totalSolarInt, "fromGrid"=>$totalGridInt),
	"requestData"=>$_POST,
	"requestURL"=>$baseURL.$interval."&t=".$start."&f=".$end
);
//echo $json_array[0];
//echo($baseURL.$interval."&t=".$start."&f=".$end."\n");
//echo(date("F j, Y, g:i a", $start)."\n".date("F j, Y, g:i a", $end)."\n");
echo json_encode($json_array);
//print_r($intervalData);
?>

