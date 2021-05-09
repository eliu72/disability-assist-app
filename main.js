
var places = document.querySelector('select');


// script for getting user geolocation
function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(storePosition);
    } else { 
        alert("Geolocation is not supported by this browser.");
    }
}

// store position in local storage
function storePosition(position) {
    console.log("Latitude: " + position.coords.latitude + " Longitude: " + position.coords.longitude);
    
    localStorage.setItem('airport', 'ATL');
    localStorage.setItem('map', 'C');
    localStorage.setItem('destination', 'C33');
    localStorage.setItem('userLat', position.coords.latitude);
    localStorage.setItem('userLon', position.coords.longitude);

    console.log(localStorage.getItem('airport'));
    console.log(localStorage.getItem('map'));
    console.log(localStorage.getItem('destination'));
    console.log(localStorage.getItem('userLat'));
    console.log(localStorage.getItem('userLon'));
}

// make a DL for the list of directions
function makeDL(array){
  // Create the list element:
  var list = document.createElement("DL");

  for (var i = 0; i < array.length; i++) {

      // Create the list item:
      var item = document.createElement('DT');
      var description = "Head " + array[i]['direction']['degrees'].toFixed(0) + " " + array[i]["direction"]["bearing"]
      item.appendChild(document.createTextNode(description));

      var itemDescription = document.createElement("DD");
      var distance = (array[i]["distance"]["miles"] * 1609.344).toFixed(0);
      itemDescription.appendChild(document.createTextNode(distance + "m"));

      // Add it to the list:
      list.appendChild(item);
      list.appendChild(itemDescription);
      list.appendChild(document.createElement("HR"));
  }

  return list
}

// make DL for list of places on the map to navigate to
function makeDL_places(array){
    // Create the list element:
    var length = Object.keys(array).length;

    for (var i = 0; i < length; i++) {

        var option = document.createElement('option');
        option.textContent = Object.keys(array)[i];
        option.setAttribute('data-value', Object.keys(array)[i]);

        //option.setAttribute('data-lang', voices[i].lang);
        //option.setAttribute('data-name', voices[i].name);
        places.appendChild(option);
        // // Create the list item:
        // var button = document.createElement('input');
        // var br = document.createElement('br');

        // button.type = 'radio';
        // button.value = Object.keys(array)[i];
        // button.name = "places";

        // var label = document.createElement('label');
        // label.for = button.value;
        // label.textContent = button.value;

        // button.addEventListener('click', function() {
        //     localStorage.setItem("mapID", button.value);
        //     console.log(localStorage.getItem("mapID"));
        //     console.log(label.textContent);
        // });
  
        // // Add it to the list:
        // list.appendChild(button);
        // list.appendChild(label);
        // list.appendChild(br);
    }

    //return places
}

function displayPlaces(){
    var apiUrl = 'https://disability-assist.herokuapp.com/api/places?airport=ATL&map=C';
    
    fetch(apiUrl).then(response => {
        return response.json();
    }).then(data => {

        // Work with JSON data here
        console.log(data);
        makeDL_places(data);
    }).catch(err => {

        // Do something for an error here
        console.log("Error with getting list of places.")

    });
}

// function to calculate path from user to destination
function calculatePath(){
    var mapID = places.selectedOptions[0].getAttribute('data-value');
    var apiUrl = 'https://disability-assist.herokuapp.com/api/path?lat=' + localStorage.getItem('userLat') + '&lon=' + localStorage.getItem('userLon') + '&airport=ATL&map=C&destID=' + mapID;
    
    fetch(apiUrl).then(response => {
        return response.json();
    }).then(data => {
        console.log("hello");
        // Work with JSON data here
        localStorage.setItem("path", JSON.stringify(data));
        localStorage.setItem("currentStep", 0);
        localStorage.setItem("numDirections", data.length);
        location.href = "route.html";
    }).catch(err => {

        // Do something for an error here
        console.log("Error with getting path to destination.")

    });
}

function displayPath(){
    document.getElementById("directions").appendChild(makeDL(JSON.parse(localStorage.getItem("path"))));
}


// return a string for the curr direction to be spoken
function getCurrDirection(){
    var currStep = parseInt(localStorage.getItem("currentStep"));

    if (currStep >= parseInt(localStorage.getItem("numDirections"))){
        // go to end route screen
        return " You have arrived at your final destination. Double tap the middle of your screen to end route.";
    }
    else {
        var currDir = JSON.parse(localStorage.getItem("path"))[currStep];
        var currBearing = currDir["direction"]["degrees"].toFixed(0) + " " + currDir["direction"]["bearing"];
        var currDist = (currDir["distance"]["miles"] * 1609.344).toFixed(0) + " meters";
        var output = " Direction begins now. Head " + currBearing + " for " + currDist + ". Direction end.";
        return output;
    }
}


// function that speaks the current direction
function speak() {

    // speech synthesis
    // https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API/Using_the_Web_Speech_API#demo
    var synth = window.speechSynthesis;

    var defaultTxt = "When you have arrived at your destination, double tap the middle of your screen.";
    var voiceSelect = "en-US";

    var pitch = 1;
    var rate = 0.9;

    var voices = synth.getVoices();
  
    // utterThis is a speech synthesis utterance object
    var inputTxt = defaultTxt + getCurrDirection();
    console.log(inputTxt);
    var utterThis = new SpeechSynthesisUtterance(inputTxt);

    // set the voice to en-US
    for (var i = 0; i < voices.length; i++){
        if (voices[i].lang == voiceSelect){
            utterThis.voice = voices[i];
        }
    }

    // set the pitch and rate
    utterThis.pitch = pitch;
    utterThis.rate = rate;

    // speak it!
    synth.speak(utterThis);

    // utterThis.onpause = function(event) {
    //     var char = event.utterance.text.charAt(event.charIndex);
    //     console.log('Speech paused at character ' + event.charIndex + ' of "' +
    //     event.utterance.text + '", which is "' + char + '".');
    // }
}

// detect double tap on screen
var mylatesttap;
function doubletap() {

   var now = new Date().getTime();
   var timesince = now - mylatesttap;

   if((timesince < 600) && (timesince > 0)){

        // if still iterating through directions, increment the currentStep and speak the next direction
        if (parseInt(localStorage.getItem("currentStep")) < parseInt(localStorage.getItem("numDirections"))){
            console.log("double tap");
            localStorage.setItem("currentStep", 1+parseInt(localStorage.getItem("currentStep")));
            speak();
        }
        else {
            location.href = "end.html";
            localStorage.setItem("currentStep", 0);
        }

   } else{
        // too much time to be a doubletap
        console.log("single tap");
    }

   mylatesttap = new Date().getTime();

}
