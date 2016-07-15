var fs=require('fs');

var readable=fs.createReadStream("Crimes_-_2001_to_present.csv");
var isdata=true;
var buffer = '';
var count=0;
var jsondata;
var success=true;
var keys;
var values;
var wfd=fs.openSync('data4.json',"w");
var bytes=0;
//var ws = fs.createWriteStream('data4.json');
function sleep(milliseconds) {
  var start = new Date().getTime();
  for (var i = 0; i < 1e7; i++) {
    if ((new Date().getTime() - start) > milliseconds){
      break;
    }
  }
}

function toWrite(chunk){
  var lines = (buffer + chunk).split(/\r?\n/g);
  buffer = lines.pop();
  for (var i = 0; i < lines.length; ++i) {
  	//ws.cork();
	if(count===0){
		keys=lines[i].split(",");
		count++;
		//ws.write("[\n");
		fs.writeSync(wfd,"[\n");
	}
	else{
		jsondata="{";
		matchs=lines[i].match(/(".*?")/g,"_replace_");
		lines1=lines[i].replace(/(".*?")/g,"_replace_");
		values=lines1.split(',');
		replacecount=0;
		for(var j=0;j<values.length;j++){
			if(values[j]==="_replace_"){
				if(j===values.length-1) jsondata=jsondata+'"'+ keys[j]+'"'+" : "+matchs[replacecount]+"},"
				else jsondata=jsondata+'"'+ keys[j]+'"'+" : "+matchs[replacecount]+" , ";
				replacecount++;
			}
			else{
				if(j===values.length-1) jsondata=jsondata+'"'+ keys[j]+'"'+" : "+'"'+values[j]+'"'+"},"
				else jsondata=jsondata+'"'+ keys[j]+'"'+" : "+'"'+values[j]+'"'+" , ";
			}
		}
		//success=ws.write(jsondata + "\n" );
		bytes=bytes+fs.writeSync(wfd,jsondata+"\n");
		//console.log(success);
		if(success==false){// console.log("failed\n")
			
			//ws.once('drain',toWrite);
			 }
	}
	//console.log(lines[i]);
    // do something with `lines[i]`
    //console.log('found line: ' + inspect(lines[i]));
    //ws.uncork();
    //process.nextTick(() => ws.uncork());
  }
  console.log(bytes);
};
/*var data;
while(isdata){
	data=readfd.read();
console.log(data);
}
console.log("finished");

var readable = getReadableStreamSomehow();*/
readable.on('readable', function() {
  var chunk;
  while (null !== (chunk = readable.read())) {
    //console.log(chunk.toString());
    toWrite(chunk.toString());
  }
  fs.writeSync(wfd,"\b\b\n]");
});