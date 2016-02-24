function zeroFill( number, width )
{
	width -= number.toString().length;
	if ( width > 0 )
	{
		return new Array( width + (/\./.test( number ) ? 2 : 1) ).join( '0' ) + number;
	}
	return number + ""; // always return a string
}
function start_clock(timeURL) {
	var offset = 0;
	function calcOffset() {
		var xmlhttp = new XMLHttpRequest();
		xmlhttp.open("GET", timeURL, false);
		xmlhttp.send();

		var dateStr = xmlhttp.getResponseHeader('Date');
		var serverTimeMillisGMT = Date.parse(new Date(Date.parse(dateStr)).toUTCString());
		var localMillisUTC = Date.parse(new Date().toUTCString());

		offset = serverTimeMillisGMT -  localMillisUTC;
	}

	function getServerTime() {
		var date = new Date();

		date.setTime(date.getTime() + offset);

		return date;
	}


	var date;
	var clientTime;
	var syncServerTime = function(){
		calcOffset();
		date = getServerTime();
		clientTime = new Date();
	};
	
	var localAddTime = function(timeOffset){
		date = new Date(date.getTime() + timeOffset);
	}
	
	var updateTimer = function(){
		var nowTime = new Date();
		var timeOffset = nowTime.getTime() - clientTime.getTime();
		if( timeOffset > 2000 || timeOffset < 0 ){
			syncServerTime();
			console.log("Sync!");
		}	
		else {
			localAddTime(timeOffset);
			clientTime = nowTime;
		}

		document.getElementById('timer').innerHTML = '<i class="fa fa-clock-o"></i> ' + zeroFill(date.getHours(), 2) + ":" + zeroFill(date.getMinutes(), 2) + ":" + zeroFill(date.getSeconds(), 2);
	
		setTimeout(updateTimer, 1000);
	}

	syncServerTime();
	updateTimer();
}
