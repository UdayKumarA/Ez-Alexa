var speechOutput;
var reprompt;

"use strict";

var Alexa = require('alexa-sdk');
const APP_ID = 'amzn1.ask.skill.56ea1bd8-65f7-4e89-961e-3f4d4f064db3';

var http = require("http");

var deviceIdoption = {
  "method": "PUT",
  "hostname": "alexa-staging.evolutyzlabs.com",
  "port": null,
  "path": "/api/Alexa/AlexaWakeUp",
  "headers": {
    "content-type": "application/json",
    "cache-control": "no-cache"
  },
  "rejectUnauthorized": false
};

var validatepasscode = {
  "method": "PUT",
  "hostname": "alexa-staging.evolutyzlabs.com",
  "port": null,
  "path": "/api/Alexa/validatepin",
  "headers": {
    "content-type": "application/json",
    "cache-control": "no-cache"
  },
  "rejectUnauthorized": false
};

var options0 = {
  "method": "POST",
  "hostname": "alexa-staging.evolutyzlabs.com",
  "port": null,
  "path": "/api/Alexa/AlexaGetAuthUsers",
  "headers": {
    "content-type": "application/json",
    "cache-control": "no-cache",
    "postman-token": "a3cf7688-f519-c8a6-c58d-7ea79ba5cbee"
  }
};


var options1 = {
  "method": "POST",
  "hostname": "alexa-staging.evolutyzlabs.com",
  "port": null,
  "path": "/api/Alexa/AlexaGetTimeSheet",
  "headers": {
    "content-type": "application/json",
    "cache-control": "no-cache"
  },
  "rejectUnauthorized": false
};

var options2 = {
  "method": "POST",
  "hostname": "alexa-staging.evolutyzlabs.com",
  "port": null,
  "path": "/api/Alexa/AlexaSubmittedTimesheet",
  "headers": {
    "content-type": "application/json",
    "cache-control": "no-cache"
  },
  "rejectUnauthorized": false
};


var currenttimesheetstatus = {
  "method": "POST",
  "hostname": "alexa-staging.evolutyzlabs.com",
  "port": null,
  "path": "/api/Alexa/AlexaCheckStatus",
  "headers": {
    "content-type": "application/json",
    "cache-control": "no-cache"
  },
  "rejectUnauthorized": false
};

var chunks = [];
speechOutput = '';

const handlers = {
    'LaunchRequest': function() {
        let awsemit = this;
        let deviceId = this.event.context.System.device.deviceId;
        console.log("DeviceID :: " + deviceId);
        var req = http.request(deviceIdoption, function (res) {
          var chunks = [];
            speechOutput = '';
            res.on("data", function (chunk) {
                chunks.push(chunk);
            });
            
            res.on("end", function () { 
                var body = Buffer.concat(chunks);
                let data = JSON.parse(body.toString());
                speechOutput = "";
                if(data.Status == 0){
                    awsemit.emit(':ask', 'Hello, Welcome to Evolutyz. Please Tell me your Passcode');
                }
                else
                {
                    awsemit.emit(':ask', "Hello " + data.Name + ", How can i help you.");
                }
            });
        });
        req.on("error", function(xhr, err, status){
          console.log("xhr :: " + xhr);
          console.log("err :: " + err);
          console.log("status :: " + status);
        });
        req.write(JSON.stringify({ "DeviceId": deviceId }));
        req.end();
    },
    
    'AMAZON.HelpIntent': function() {
        speechOutput = 'You can ask me to timesheet details, Work status, work info and so on. How can I help you?';
        reprompt = 'I am sorry, I didnt catch that. try to ask Evolutyz related';
        this.emit(':ask', speechOutput, reprompt);
    },
    'AMAZON.CancelIntent': function() {
        speechOutput = 'Would you like to cancel?';
        this.emit(':tell', speechOutput);
    },
    'AMAZON.StopIntent': function() {
        speechOutput = 'I hope I helped you. Goodbye!';
        this.emit(':tell', speechOutput);
    },
    'SessionEndedRequest': function() {
        speechOutput = '';
        //this.emit(':saveState',true);//uncomment to save attributes to db on session end
        this.emit(':tell', speechOutput);
    },
    'AMAZON.FallbackIntent': function() {
        speechOutput = '';
        //Any intent slot variables are listed here for convenience
        //Your custom intent handling goes here
        speechOutput = "I currently do not support your request. How can I help?";
        this.emit(":tell", speechOutput);
    },
    'AMAZON.NavigateHomeIntent': function() {
        speechOutput = '';
        //any intent slot variables are listed here for convenience
        //Your custom intent handling goes here
        speechOutput = "Welcome to Evolutyz! How can I help you today";
        this.emit(":tell", speechOutput);
    },
    
    'Unhandled': function() {
         this.handler.state = '';
         //this.response.speak('');
         //this.emit(':responseReady');
    },
    'requestpasscode': function() {
        let awsemit = this;
        const deviceId = this.event.context.System.device.deviceId;
        let passcode = this.event.request.intent.slots.PassCode.value;
        var req = http.request(validatepasscode, function (res) {
            var chunks = [];
            speechOutput = '';
            res.on("data", function (chunk) {
                chunks.push(chunk);
            });
            res.on("end", function () { 
                var body = Buffer.concat(chunks);
                let data = JSON.parse(body.toString());
                speechOutput = '';
                if(data.Flag === 0){
                    awsemit.emit(':ask', 'Your Passcode is Does not match in our records, please contact system administrator.');
                }
                else{
                    awsemit.emit(':ask', 'Your Passcode is validated, you are autherized to access. please continue to timesheet details');
                }
            });
        });
        req.write(JSON.stringify({ "DeviceId" : deviceId, "pin": passcode }));
        req.end(); 
    },
    
    'timesheetdetails': function() {
        let awsemit = this;
        const deviceId = this.event.context.System.device.deviceId;
        var req = http.request(options1, function(res) {
            var chunks = [];
            res.on("data", function (chunk) {
                chunks.push(chunk);           
            });
            res.on("end", function () { 
                var body = Buffer.concat(chunks);
                let data = JSON.parse(body.toString());
                awsemit.emit(":ask", "Mr " + data.FirstName + ", Working days " + data.Workingdays + ", Working Hours " + data.Workinghours + ", Holidays Count " + data.HolidaysCount + ". ");
            });
            req.on("error", function(xhr, err, status){
                console.log("xhr :: " + xhr);
                console.log("err :: " + err);
                console.log("status :: " + status);
            });
        });
        req.write(JSON.stringify({ "DeviceId" : deviceId, "Month": 0 }));
        req.end(); 
    },
    'submitmytimesheet': function() {
        let awsemit = this;
        const deviceId = this.event.context.System.device.deviceId;
        var req = http.request(options2, function (res) { 
            var chunks = [];
            speechOutput = '';
            res.on("data", function (chunk) {
                chunks.push(chunk);
            });
            res.on("end", function () { 
                var body = Buffer.concat(chunks);
                console.log(body.toString());
                let data = JSON.parse(body.toString());
                speechOutput = '';
                awsemit.attributes.rqstpasscode = data.Pin;
                switch(data.Timesheetstatus) { 
                    case 0:
                        speechOutput = 'Your timesheet not submited.';
                        break;
                    case 1:
                        speechOutput = "Your timesheet submited with " + data.GetWorkingHours + " hours";
                        break;
                }
                awsemit.emit(":ask", speechOutput);
            });
        });
        req.write(JSON.stringify({ "deviceid" : deviceId, "Month": 0 }));
	    req.end();
    },
    
    'timesheetstatus': function() {
        let awsemit = this;
        const deviceId = this.event.context.System.device.deviceId;
        var req = http.request(currenttimesheetstatus, function (res) { 
            var chunks = [];
            speechOutput = '';
            res.on("data", function (chunk) {
                chunks.push(chunk);
            });
            res.on("end", function () { 
                var body = Buffer.concat(chunks);
                console.log(body.toString());
                let data = JSON.parse(body.toString());
                speechOutput = '';
                //awsemit.attributes.rqstpasscode = data.Pin;
                switch(data.Response) { 
                   case "0":
                        speechOutput += "Your time sheet not submited.";
                        break;
                    case "1":
                        speechOutput += "Your time sheet submitted but not approved by your manager.";
                        break;
                    case "2":
                        speechOutput += "Your time sheet submitted but not approved by your second level manager.";
                        break;
                    case "3":
                        speechOutput += "your time sheet approved.";
                        break;
                }
                awsemit.emit(":ask", speechOutput);
            });
        });
 
        req.write(JSON.stringify({ "Deviceid" : deviceId, "Month": 0 }));
	    req.end();
    },
};

exports.handler = (event, context) => {
    const alexa = Alexa.handler(event, context);
    alexa.APP_ID = APP_ID;
    alexa.registerHandlers(handlers);
    alexa.execute();
};



/*

Voice command Request & Responses:

Alexa, Open evolutyz            --->   Hello, Welcome to Evolutyz, Please Tell me your Passcode?
9874                            --->   Your Passcode is Does not match in our records, please contact system administrator.
Alexa, Open Evolutyz            --->   Hello, Welcome to Evolutyz, Please Tell me your Passcode?
8888                            --->   Your Passcode is validated, you are autherized to access. please continue to timesheet details
Alexa, Open timesheet details   --->   Mr Krishna, Working days 22, Workinghours 168, HolidaysCount 0.
Alexa, Submit my timesheet      --->   Your timesheet not submited/ Your timesheet submited with 168 hours.
Alexa, tell timesheet status    --->   Your time sheet not submited/ Your time sheet submitted but not approved by your manager/ Your time sheet submitted but not approved by your second level manager/ your time sheet approved.

*/
