<?php
header('Content-Type: application/json');
//****************API Documentation: https://www.egauge.net/docs/egauge-xml-api.pdf****************

if (count($_POST) == 0) {
  //exit;
};
date_default_timezone_set('America/Los_Angeles');
$firstURL = "http://egauge16844.egaug.es/57A4C/cgi-bin/egauge?tot&inst"; //returns totals of power generated and used, plus instantaneous wattage generated and used;
$prettyDate = "F j, Y, g:i a";
$baseData = new SimpleXMLElement(file_get_contents($firstURL));

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


$json_array=array(
//	"beginDate"=>(string)$intervalData->data->attributes()['epoch'],
	"fromBeginning" => array("generation" => $totalMade, "consumption" => $totalUsed),
	"instant" => array("generation" => $instantMade, "consumption" => $instantUsed),
//	"intervalTotals" => array("consumed"=>$totalPowerInt, "generated"=>$totalSolarInt, "fromGrid"=>$totalGridInt),
//	"requestData"=>$_POST,
	"requestURL"=>$firstURL
);
//echo $json_array[0];
//echo($baseURL.$interval."&t=".$start."&f=".$end."\n");
//echo(date("F j, Y, g:i a", $start)."\n".date("F j, Y, g:i a", $end)."\n");
echo json_encode($json_array);
//print_r($intervalData);
?>

