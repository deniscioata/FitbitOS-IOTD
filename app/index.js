import clock from "clock";
import document from "document";

import * as util from "../common/utils";
import { inbox } from "file-transfer";
import * as messaging from "messaging";

// Listen for the onopen event
messaging.peerSocket.onopen = function() {
  // Ready to send or receive messages
    console.log("Watch socket on open");
}

let x = 3;
console.log(x);

// Listen for the onerror event
messaging.peerSocket.onerror = function(err) {
  // Handle any errors
  console.log("Connection error: " + err.code + " - " + err.message);
}

// Send a message to the peer
function triggerDownload() {
  // Sample data
  var data = {
    title: 'FetchImage'
  }

  console.log("Ready state: " + messaging.peerSocket.readyState);

  if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
    // Send the data to peer as a message
    messaging.peerSocket.send(data);
    console.log("sending data");
  }
}


// Update the clock every minute
clock.granularity = "minutes";

// Get a handle on the <text> element
let myLabel = document.getElementById("myLabel");

// Update the <text> element with the current time
function updateClock() {
  let today = new Date();
  let hours = today.getHours();
  let mins = util.zeroPad(today.getMinutes());

  myLabel.text = `${hours}:${mins}`;
  
  triggerDownload();
}

// Update the clock every tick event
clock.ontick = () => updateClock();

function updateImage(filename) {
  let bgImage = document.getElementById("bgImage"); 
  bgImage.href = filename;
}

// Event occurs when new file(s) are received
inbox.onnewfile = function () {
  console.log("new file");
  var fileName;
  do {
    // If there is a file, move it from staging into the application folder
    fileName = inbox.nextFile();
    if (fileName) {
      let path = "/private/data/" + fileName;
      console.log(path + " is now available");
      updateImage(path)
    }
  } while (fileName);
};
