var form = document.getElementById('solarForm'),
	formData = formData || {
		start : "",
		end : ""
	},
	list = document.getElementById('results'),
	instantProd = document.getElementById('currProd'),
	instantCons = document.getElementById('currCons'),
	lifetimeCons = document.getElementById('totalConsLife'),
	lifetimeProd = document.getElementById('totalProdLife'),
	intCons = document.getElementById('intCons'),
	intGrid = document.getElementById('intGrid'),
	intProd = document.getElementById('intProd'),	
	req = new XMLHttpRequest(),
	resultsObj  = resultsObj || {};


function processForm(event){
	event.preventDefault();
//	var tempData = {
//		start : Date.parse(event.target.start.value),
//		end : Date.parse(event.target.end.value)
//		};
	var start = Math.floor(Date.parse(event.target.start.value+"T00:00-07:00")/1000);
	var end = Math.floor(Date.parse(event.target.end.value+"T00:00-07:00")/1000);
	req.open("POST", "solar.php");
	req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");	
	req.send("start="+start+"&end="+end+"&interval=h");
	
}


function addInstantData(){
	instantProd.textContent = resultsObj.instant.generation;
	instantCons.textContent = resultsObj.instant.consumption;
	lifetimeCons.textContent = resultsObj.fromBeginning.consumption;
	lifetimeProd.textContent = resultsObj.fromBeginning.generation;
}

function addRangeData(){
	instantProd.textContent = resultsObj.instant.generation;
	instantCons.textContent = resultsObj.instant.consumption;
	intProd.textContent = resultsObj.intervalTotals.generated;
	intCons.textContent = resultsObj.intervalTotals.consumed;
	intGrid.textContent = resultsObj.intervalTotals.fromGrid;

}
function initialLoad(){
	req.open("POST", "solar.php");
	req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");	
	req.send("type=instant");

}

req.onreadystatechange = function() {
	if (this.readyState==4){
		resultsObj = JSON.parse(this.responseText);
		if (resultsObj.requestData.type==="instant"){
			addInstantData()
		}else{
			addRangeData()
		}
	}	
};



//event listeners
form.addEventListener("submit", processForm);	
initialLoad();