/*global variable declaration*/
var fs = require('fs'),
    buffer = '',
    count = 0,
    robberyAndBurglaryJsondata, criminal, keys, values, date, dateArr, robberyJsondata = {},
    robberyDayCount = {},
    bulguryDayCount = {},
    criminalDamageToProperty = {},
    criminalDamageToVehical = {},
    criminalDamageToSSP = {};

/* formate the date String*/
function toFormatedDate(d) {
    var month = d.getMonth() + 1;
    if (month < 10) {
        monthString = "0" + month;
    } else {
        monthString = "" + month;
    }
    var day = d.getDate();
    if (day < 10) {
        dayString = "0" + day;
    } else {
        dayString = "" + day;
    }
    yearString = "" + d.getFullYear();

    return monthString + "/" + dayString + "/" + yearString;
}

/*creating Raw data for 3 json*/
function toWrite(chunk) {
    var lines = (buffer + chunk).split(/\r?\n/g); /*spliting line */
    buffer = lines.pop();
    for (var i = 0; i < lines.length; ++i) {

        if (count === 0) {
            keys = lines[i].split(",");
            count++;
        } else {
            matchs = lines[i].match(/(".*?")/g, "_replace_");
            linesReplace = lines[i].replace(/(".*?")/g, "_replace_"); /*seprating column*/
            values = linesReplace.split(',');
            dateArr = values[2].split(" ");
            date = dateArr[0];

            if (values[5] === "ROBBERY") {
                if (robberyDayCount[date]) robberyDayCount[date]++;
                else robberyDayCount[date] = 1;
                if (robberyJsondata[values[6]]) robberyJsondata[values[6]]++;
                else robberyJsondata[values[6]] = 1;
            } else if (values[5] === "BURGLARY") {
                if (bulguryDayCount[date]) bulguryDayCount[date]++;
                else bulguryDayCount[date] = 1;
            } else if (values[5] === "CRIMINAL DAMAGE") {
                if (values[6] === "TO PROPERTY") {
                    if (criminalDamageToProperty[values[17]]) criminalDamageToProperty[values[17]]++;
                    else criminalDamageToProperty[values[17]] = 1;
                } else if (values[6] === "TO VEHICLE") {
                    if (criminalDamageToVehical[values[17]]) criminalDamageToVehical[values[17]]++;
                    else criminalDamageToVehical[values[17]] = 1;
                } else if (values[6] === "TO STATE SUP PROP") {
                    if (criminalDamageToSSP[values[17]]) criminalDamageToSSP[values[17]]++;
                    else criminalDamageToSSP[values[17]] = 1;
                }
            }
        }
    }
};

/*function to open ,process and close write Streams*/
function writeInFile(FileName, fn) {
    fd = fs.openSync(FileName, "w");
    fn(fd);
    fs.closeSync(fd);
};

/*function for Formatting Data and writing in robberyAndBurglary*/
var wirterobberyAndBurglaryData = function(robberyAndBurglaryJsondatafd) {
        /*Robbery and burlugary json Creation  and writing files*/
        fs.writeSync(robberyAndBurglaryJsondatafd, "[\n");
        var now = new Date(2016, 3, 20);
        var nowFormated = toFormatedDate(now);
        var formatedDate;
        for (var d = new Date(2001, 0, 1); d <= now; d.setDate(d.getDate() + 1)) {
            formatedDate = toFormatedDate(d);
            var x1, x2;
            if (robberyDayCount[formatedDate]) x1 = robberyDayCount[formatedDate];
            else x1 = 0;
            if (bulguryDayCount[formatedDate]) x2 = bulguryDayCount[formatedDate];
            else x2 = 0;
            robberyAndBurglaryJsondata = '{"date":"' + formatedDate + '","ROBBERY":' + x1 + ',"BURGLARY":' + x2 + '}';
            if (nowFormated !== formatedDate) {
                robberyAndBurglaryJsondata = robberyAndBurglaryJsondata + ",\n";
            } else robberyAndBurglaryJsondata = robberyAndBurglaryJsondata + "\n";
            fs.writeSync(robberyAndBurglaryJsondatafd, robberyAndBurglaryJsondata);
        }
        fs.writeSync(robberyAndBurglaryJsondatafd, "]");

    }
    /*writing criminal Data in file*/
var wirteCriminalData = function(criminalfd) {
    /*Criminal Damage json formatted and write in file*/
    fs.writeSync(criminalfd, "[\n");
    for (var year = 2001; year <= 2016; year++) {
        criminal = '{"year":"' + year + '","criminalDamageToVehical":"' + criminalDamageToVehical[year] + '","criminalDamageToSSP":"' + criminalDamageToSSP[year] + '","criminalDamageToProperty":"' + criminalDamageToProperty[year] + '"}';
        if (year !== 2016) criminal = criminal + ",\n";
        else criminal = criminal + "\n";
        fs.writeSync(criminalfd, criminal);
    }
    fs.writeSync(criminalfd, "]");
};
/*writing data for types of robberry*/
var wirteRobberyTypeData = function(robberyJsondatafd) {
    var tempjson = {},
        robberyJsondataModify = [];
    /*robbery json creation and creating file*/
    Object.keys(robberyJsondata).forEach(function(key) {
        tempjson["typeofrobbery"] = key;
        tempjson["count"] = robberyJsondata[key];
        robberyJsondataModify.push(tempjson);
        tempjson = {};
    });
    fs.writeSync(robberyJsondatafd, JSON.stringify(robberyJsondataModify));
};

/* here Starts The Peogram*/
var readable = fs.createReadStream("../../../Crimes_-_2001_to_present.csv");
/*readable event */
readable.on('readable', function() {
    var chunk;
    if (null !== (chunk = readable.read())) {
        toWrite(chunk.toString());
    }
});

/*After Reading Work*/
readable.on('end', function() {
    writeInFile("../../data/robberyData.json", wirteRobberyTypeData);
    writeInFile("../../data/criminalData.json", wirteCriminalData);
    writeInFile("../../data/robberyAndBurglaryData.json", wirterobberyAndBurglaryData);

});
