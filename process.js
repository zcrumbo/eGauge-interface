//todo: error handling, input validation, network feedback, feedback on dates in results

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
	getToday = document.getElementById('today'),
	getThisMonth = document.getElementById('thisMonth'),
	getThisYear = document.getElementById('thisYear'),
	submitBtn = document.getElementById('solarSubmit'),
	req = new XMLHttpRequest(),
	resultsObj  = resultsObj || {};


function processForm(event){
	event.preventDefault();
	var interval = "",
		endHours = event.target.hours.value,
		start = Math.floor(Date.parse(event.target.start.value+"T00:00-08:00")/1000),
		end = Math.floor(Date.parse(event.target.end.value+endHours+"-08:00")/1000),
		diff = end-start,
		skip = "",
		oneDay = 86400;
	if(diff<=(2*oneDay)){//two days or less
		interval = "m";
	}else if (diff>(2*oneDay)&&diff<=(365*oneDay)){//more than two days to less than 1 year
		interval = "d";
	}else if (diff>(365*oneDay)){//more than two months
		interval = "d";
		skip = "&skip=29";
	}else {
		interval = "d";
	}
	req.open("POST", "solar.php");
	req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");	
	req.send("start="+start+"&end="+end+"&interval="+interval+skip);
	
}
function processPreset(event){
	event.preventDefault();
	var range = event.target.id,
		today = ISODateString(new Date());
	switch(range){
		case 'today':
			form.start.value =today.substr(0, 10);	
			form.hours.value =today.substr(10, 6);
			break;
		case 'thisMonth':
			form.start.value =today.substr(0, 8)+"01";	
			break;
		case 'thisYear':
			form.start.value =today.substr(0, 5)+"01-01";	
			break;
	}

	form.end.value =today.substr(0, 10);		
	submitBtn.click();
	form.reset();
	form.hours.value = "T00:00";
}
function addInstantData(){
	instantProd.textContent = resultsObj.instant.generation+" Watts";
	instantCons.textContent = resultsObj.instant.consumption+" Watts";
	lifetimeCons.textContent = (resultsObj.fromBeginning.consumption/1000).toFixed(2)+" kWh";
	lifetimeProd.textContent = (resultsObj.fromBeginning.generation/1000).toFixed(2)+" kWh";
}

function addRangeData(){
	instantProd.textContent = resultsObj.instant.generation+" Watts";
	instantCons.textContent = resultsObj.instant.consumption+" Watts";
	intProd.textContent = (resultsObj.intervalTotals.generated).toFixed(2)+" Wh";
	intCons.textContent = (resultsObj.intervalTotals.consumed).toFixed(2)+" Wh";
	intGrid.textContent = (resultsObj.intervalTotals.fromGrid).toFixed(2)+" Wh";

}
function initialLoad(){
	req.open("POST", "solar.php");
	req.setRequestHeader("Content-type", "application/x-www-form-urlencoded");	
	req.send("type=instant");
}
//adapted from https://developer.mozilla.org/en/Core_JavaScript_1.5_Reference:Global_Objects:Date for local time zone
function ISODateString(d) {
    function pad(n) {return n<10 ? '0'+n : n}
    return d.getUTCFullYear()+'-'
         + pad(d.getMonth()+1)+'-'
         + pad(d.getDate())+'T'
         + pad(d.getHours())+':'
         + pad(d.getMinutes())+':'
         + pad(d.getSeconds())+'Z'
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
getToday.addEventListener("click", processPreset);
getThisMonth.addEventListener("click", processPreset);
getThisYear.addEventListener("click", processPreset);
initialLoad();