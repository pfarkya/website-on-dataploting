var fs=require('fs');

var readable=fs.createReadStream("Crimes_-_2001_to_present.csv");
var isdata=true;
var buffer = '';
var count=0;
var rbJsondata;
var cdJsondata;
var robJsondata={};
var success=true;
var keys;
var values;
//var wfd=fs.openSync('data4.json',"w");
var rbJsondatafd=fs.openSync('rdData.json',"w");
var cdJsondatafd=fs.openSync('cdData.json',"w");
var robJsondatafd=fs.openSync('robData.json',"w");
var bytes=0;
var dateArr;
var prevDate;
var date;
var prevDatems;
var nextDatems;
var robberyDayCount={};
var bulguryDayCount={};
var criminalDamageToProperty={};
var criminalDamageToVehical={};
var criminalDamageToSSP={};
var robJsondataModify=[];
function toFormatedDate(d){
	var month=d.getMonth()+1;
	if(month<10){
		monthString="0"+month;
	}
	else{
		monthString=""+month;
	}
	var day=d.getDate();
	if(day<10){
		dayString="0"+day;
	}
	else{
		dayString=""+day;
	}
	yearString=""+d.getFullYear();

	return monthString+"/"+dayString+"/"+yearString;

}

function toWrite(chunk){
  var lines = (buffer + chunk).split(/\r?\n/g);
  buffer = lines.pop();
  for (var i = 0; i < lines.length; ++i) {

	if(count===0){
		keys=lines[i].split(",");
		count++;
		//fs.writeSync(wfd,"[\n");
	}
	else{
		jsondata="{";
		matchs=lines[i].match(/(".*?")/g,"_replace_");
		lines1=lines[i].replace(/(".*?")/g,"_replace_");
		values=lines1.split(',');
		replacecount=0;
		dateArr = values[2].split(" ");
		date=dateArr[0];
/*		if(count===1){
			date=dateArr[0];
			prevDatems=Date.parse(date);
			nextDatems=Date.parse(date);
			prevDate=date;
			count++;
		}
		else{
			prevDate=date;
			date=dateArr[0];
			prevDatems=Date.parse(prevDate);
			nextDatems=Date.parse(date);			
		}
		if(nextDatems>prevDatems){
			rbJsondata='{"date":"'+prevDate+'", "robberry":"'+robberyDayCount+'","bulgury":"'+bulguryDayCount+'"}\n';
			bytes=bytes+ fs.writeSync(rbJsondatafd,rbJsondata);	
			robberyDayCount=0;
			bulguryDayCount=0;	
		}*/
		if(values[5]==="ROBBERY"){
			if(robberyDayCount[date])		robberyDayCount[date]++;
			else	robberyDayCount[date]=1;
			if(robJsondata[values[6]])		robJsondata[values[6]]++;
			else robJsondata[values[6]]=1;
		}
		if(values[5]==="BURGLARY"){
			if(bulguryDayCount[date])		bulguryDayCount[date]++;
			else	bulguryDayCount[date]=1;
			//bulguryDayCount++;
		}
		if(values[5]==="CRIMINAL DAMAGE"){
			if(values[6]==="TO PROPERTY"){
				if(criminalDamageToProperty[values[17]])	criminalDamageToProperty[values[17]]++;
				else criminalDamageToProperty[values[17]]=1;
			}
			else if(values[6]==="TO VEHICLE"){
				if(criminalDamageToVehical[values[17]])		criminalDamageToVehical[values[17]]++;
				else criminalDamageToVehical[values[17]]=1;
			}
			else if(values[6]==="TO STATE SUP PROP"){
				if(criminalDamageToSSP[values[17]])		criminalDamageToSSP[values[17]]++;
				else criminalDamageToSSP[values[17]]=1;
			}
		}
  	}
  //console.log(bytes);
  }
};

readable.on('readable', function() {
  var chunk;
  while (null !== (chunk = readable.read())) {
    //console.log(chunk.toString());
    toWrite(chunk.toString());
  }
  console.log(robJsondata);
  //console.log(criminalDamageToSSP);
  //fs.writeSync(wfd,"\b\b\n]");
});
var tempjson={};
readable.on('end',function(){
	Object.keys(robJsondata).forEach(function(key){
		tempjson["typeofrobbery"]=key;
		tempjson["count"]=robJsondata[key];
		robJsondataModify.push(tempjson);
		tempjson={};
	});
	fs.writeSync(robJsondatafd,JSON.stringify(robJsondataModify));
	fs.writeSync(cdJsondatafd,"[\n");
	for(var year=2001;year<=2016;year++){
		cdJsondata='{"year":"'+year+'","criminalDamageToVehical":"'+criminalDamageToVehical[year]+'","criminalDamageToSSP":"'+criminalDamageToSSP[year]+'","criminalDamageToProperty":"'+criminalDamageToProperty[year]+'"}';
		if(year!==2016)cdJsondata=cdJsondata+",\n";
		else cdJsondata=cdJsondata+"\n";
		fs.writeSync(cdJsondatafd,cdJsondata);
	}
	fs.writeSync(cdJsondatafd,"]");
	fs.writeSync(rbJsondatafd,"[\n");
	var now = new Date(2016,3,20);
	var nowFormated=toFormatedDate(now);
	var formatedDate;
	for (var d = new Date(2001,0,1); d <= now; d.setDate(d.getDate() + 1)) {
   	 	formatedDate=toFormatedDate(d);
   	 	var x1,x2;
   	 	if(robberyDayCount[formatedDate])x1=robberyDayCount[formatedDate];
   	 	else x1=0;
   	 	if(bulguryDayCount[formatedDate])x2=bulguryDayCount[formatedDate];
   	 	else x2=0;
   	 	rbJsondata='{"date":"'+formatedDate+'","ROBBERY":'+x1+',"BURGLARY":'+x2+'}';
   	 	if(nowFormated!==formatedDate){
   	 		rbJsondata=rbJsondata+",\n";
   	 	}
   	 	else  rbJsondata=rbJsondata+"\n";
   	 	fs.writeSync(rbJsondatafd,rbJsondata);
	}
	fs.writeSync(rbJsondatafd,"]");
});