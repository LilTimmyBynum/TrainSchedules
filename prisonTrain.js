// PrisonTrain scripts

// current time
var nowTime = moment().format('HH:mm:ss');

var myTime = {
    start: function() {
        var secondsInterval = setInterval(myTime.myClock, 1000);
    }, // end of start:
    decrTime: function() {
        var minutesInterval = setInterval(myTime.update, 2000);
    }, // end of decrTime:
    myClock: function() {
        // increase time by one second at a time
        nowTime = moment().format('HH:mm:ss');
        $("#clock").html(nowTime);
    }, // end of myClock:
    update: function() {
            killTime();
        } // end of update:  

}; // end of myTime

// extended function to manipulate next arrival and minutes away
$.fn.extend({
    goLow: function() {
        myTime.decrTime();
    }
});

var config = {
    apiKey: "AIzaSyBhH5KoKFSL_hWHrwTIyxb5BcxDn5q6VZ8",
    authDomain: "prisontrain-47a95.firebaseapp.com",
    databaseURL: "https://prisontrain-47a95.firebaseio.com",
    projectId: "prisontrain-47a95",
    storageBucket: "prisontrain-47a95.appspot.com",
    messagingSenderId: "577556409590"
};
firebase.initializeApp(config);
var database = firebase.database();

function submitBtnClick(event) {
    event.preventDefault();

    var trainName = $("#trainName").val().trim();
    var dest = $("#destination").val().trim();
    var firstTrain = $("#firstTrain").val().trim();
    var frequency = $("#frequency").val().trim();

    // if fields not filled in do nothing
    if ((trainName != "") && (dest != "") && (firstTrain != "") && (frequency != "")) {
        database.ref().push({
            dbTrain: trainName,
            dbDestination: dest,
            dbFirstTrain: firstTrain,
            dbFrequency: frequency
        });
        document.getElementById('trainForm').reset();
    };
};

function killTime() {
    $(".trainData").each(function() {
        var tempName = $(this).children("td.name").text();
        var tempDest = $(this).children("td.dest").text();
        var tempFreq = $(this).children("td.freq").text();
        var tempArrDown = $(this).children("td.arrDown").text();

        var newArrTime = calcNxtArrival(tempArrDown, tempFreq);
        var newMinsAway = calcMinsAway(newArrTime);

        // update arrival time
        $(this).children("td.arrDown").html(newArrTime);
        // update minutes away with fraction advantage to the rider
        $(this).children("td.cntDown").html(newMinsAway);
    }); // end of each loop
};

function calcNxtArrival(arrivalTime, frequency) {
    var arrTime = arrivalTime;
    var newTime = arrivalTime;
    var freq = frequency;

    if (arrTime < nowTime) {
        while (arrTime < nowTime) {
            newTime = moment(arrTime, 'HH:mm').add(freq, 'minutes').format('HH:mm');
            arrTime = newTime;
        };
    };
    return arrTime;
};

function calcMinsAway(nextArrival) {
    // nextArrival time minus current time
    var nxtArr = nextArrival;

    var a = moment(nowTime, "HH:mm:ss");
    var b = moment(nxtArr, "HH:mm:ss");
    var diffff = (b.diff(a));

    // get hours and minutes
    var hoursInMins = Math.floor(b.diff(a) / (1000 * 60 * 60)) * 60;
    var minutes = Number(moment(diffff).format("mm"));
    var minsToGo = hoursInMins + minutes;

    return minsToGo;
};

$("#submitBtn").click(submitBtnClick);

function updateSchedule() {
    database.ref().on("child_added", function(snapshot) {
        var firstTrain = moment(snapshot.val().dbFirstTrain, 'HH:mm').format('HH:mm');

        //call function to calculate next arrival
        var nextArrival = calcNxtArrival(firstTrain, Number(snapshot.val().dbFrequency));

        //create function to calculate minutes away time
        var minsAway = calcMinsAway(nextArrival);
        var addBigString = ("<tr class='trainData myCTxt'><td class='name'>" + snapshot.val().dbTrain + "</td><td class='dest'>" + snapshot.val().dbDestination +
            "</td><td class='freq'>" + snapshot.val().dbFrequency +
            "</td><td class='arrDown'>" + nextArrival + "</td><td class='cntDown'>" + minsAway + "</td></tr>");

        $('#trainTable').append(addBigString);

        // If any errors are experienced, log them to console.
    }, function(errorObject) {
        console.log("We have a situation : " + errorObject.code);
    });

    $(".trainData").goLow();
}; // end of updateSchedule function

myTime.start();
updateSchedule();
