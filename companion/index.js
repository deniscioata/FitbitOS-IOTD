// Import Outbox from the file-transfer module
import { outbox } from "file-transfer"
import { settingsStorage } from "settings";

let metaSrc = "https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY";
// let metaSrc = "https://api.nasa.gov/planetary/apod?api_key=NNKOjkoul8n1CH18TWA9gwngW1s1SmjESPjNoUFo";
// Destination filename
let destFilename = "today.jpg";

// Import the messaging module
import * as messaging from "messaging";

var downloadInProgress = false;

let x = 6;
console.log("Companion started: "+ x);

// Listen for the onopen event
messaging.peerSocket.onopen = function() {
  // Ready to send or receive messages
    console.log("Companion Socket on open");
}

// Listen for the onmessage event
messaging.peerSocket.onmessage = function(evt) {
  // Output the message to the console
  console.log(JSON.stringify(evt.data));
  updateIfNeeded();
}

function shouldUpdate() {
  let today = new Date();
  let lastUpdated = settingsStorage.getItem("lastUpdated");
  let lastUpdatedDate = new Date(lastUpdated);
  console.log(lastUpdatedDate);
  if (lastUpdated === null || today.getDate() != lastUpdatedDate.getDate()) {
    return true;
  }
  return false;
}

function updateIfNeeded() {
    console.log("updateIfNeeded");

    if (shouldUpdate() && (false == downloadInProgress)) {
      downloadImage();
    } else {
      console.log("Up To Date!");
    }
}


function downloadImage() {
  
  console.log("Downloading: "+ metaSrc);
  downloadInProgress = true
  fetch(metaSrc).then(function (response) {
      console.log("Fetched metaSrc");
      return response.json().then(function (json) { 
        console.log( json['url']);
        return json['url'];
      }).then(function (srcImage) {
        
      // let srcImage = "https://apod.nasa.gov/apod/image/1712/2017SuperMoonAlpsSuperga1024.jpg";
      let encodedSource = encodeURI(srcImage.replace("http://","").replace("https://",""));
      let resizedImageSrc = "https://images.weserv.nl/?url="+encodedSource +"&w=358&h=300";
      
      console.log("Fetch src: "+srcImage);

        fetch(resizedImageSrc).then(function (response) {
          // We need an arrayBuffer of the file contents
          console.log("Fetched image");
          return response.arrayBuffer();
        }).then(function (data) {
          // Queue the file for transfer
          console.log("Enqueue file "+ destFilename);
          outbox.enqueue(destFilename, data).then(function (ft) {
            // Queued successfully
            console.log("Transfer of '" + destFilename + "' successfully queued.");
            let today = new Date();
            settingsStorage.setItem("lastUpdated", today);
            downloadInProgress = false;
          }).catch(function (error) {
            // Failed to queue
            downloadInProgress = false;
            throw new Error("Failed to queue '" + destFilename + "'. Error: " + error);
          });
        }).catch(function (error) {
          // Log the error
            downloadInProgress = false;
          console.log("Failure: " + error);
        });
      });
    }).catch(function (error) {
        // Log the error
        downloadInProgress = false;
        console.log("Failure: " + error);
  }); 
}
