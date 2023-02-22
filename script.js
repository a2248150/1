// Victoria
let myLat = 48.4284;
let myLong = -123.3656;
let myLocation = new google.maps.LatLng(myLat, myLong);

let map;
let service;
let infoWindowPark; // for park info
let infoWindowCurrentLocation; // for your location

let markers = []; // list of all markers on the map

let radius = 5000;
let radiusTag = document.getElementById("radius");

// when the window loads, intialize the map
window.onload = initializeMap;

// intialize map
function initializeMap() {
  
  radiusTag.innerHTML = "Current Radius: " + radius;
  
  map = new google.maps.Map(document.getElementById("map"), {
    center: myLocation,
    zoom: 13
  });
  
  searchForPark(myLocation);
  
  // https://developers.google.com/maps/documentation/javascipt/infowindows
  infoWindowCurrentLocation = new google.maps.InfoWindow();
  infoWindowPark = new google.maps.InfoWindow();
  
  // Create "Pan to Current Location" button
  // https://developers.google.com/maps/documentation/javascript/geolocation
  const locationButton = document.createElement("button");
  locationButton.textContent = "Pan to Current Location";
  locationButton.classList.add("custom-map-control-button");
  
  map.controls[google.maps.ControlPosition.TOP_CENTER].push(locationButton);

  locationButton.addEventListener("click", () => currentLocation());
  
  document.getElementById("changeRadius").addEventListener("click", () => {
      
    radius = document.getElementById("radiusInput").value;
    radiusTag.innerHTML = "Current Radius: " + radius;
    currentLocation();
    
  });
  
}

function handleLocationError(browserHasGeolocation, infoWindow, pos) {
  infoWindow.setPosition(pos);
  infoWindow.setContent(
    browserHasGeolocation
      ? "Error: The Geolocation service failed."
      : "Error: Your browser doesn't support geolocation."
  );
  infoWindow.open(map);
}

function currentLocation() {
  
  // Try HTML5 geolocation.
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        infoWindowCurrentLocation.setPosition(pos);
        infoWindowCurrentLocation.setContent("Location found.");
        infoWindowCurrentLocation.open(map);
        map.setCenter(pos);

        searchForPark(pos);

      },
      () => {
        handleLocationError(true, infoWindowCurrentLocation, map.getCenter());
      }
    );
  } else {
    // Browser doesn't support Geolocation
    handleLocationError(false, infoWindowCurrentLocation, map.getCenter());
  }
  
}

// Search for parks within 5 km
// From https://developers.google.com/maps/documentation/javascript/examples/place-search#maps_place_search-javascript

function searchForPark(location) {
  
  // use places API to search for all parks within 5 km
  let request = {
    location: location,
    radius: radius,
    type: "park"
  };
  
  service = new google.maps.places.PlacesService(map);
  service.nearbySearch(request, processParks);
  
}

// process search results for parks
function processParks(results, status) {
  
  if (status == google.maps.places.PlacesServiceStatus.OK) {
    
    deleteMarkers();
    
    for (let i = 0; i < results.length ; i++) {
      let place = results[i];
      console.log(place);
      createMarker(place);
    }
    
  }
  
} // processParks

// create a marker at place
// https://developers.google.com/maps/documentation/javascript/examples/place-search
function createMarker(place) {
  
  if(!place.geometry || !place.geometry.location) return;
  
  const scaledIcon = {
    url: place.icon,
    scaledSize: new google.maps.Size(40, 40),
    origin: new google.maps.Point(0, 0), // origin
    anchor: new google.maps.Point(20, 40) // anchor
  }
  
  // https://developers.google.com/maps/documentation/javascript/markers
  const marker = new google.maps.Marker({
    map,
    position: place.geometry.location,
    icon: scaledIcon,
    title: place.name
  });
  
  google.maps.event.addListener(marker, "click", () => {
    let contentString = "<h3>" + place.name + "</h3>" + "Rating: <b>"
         + place.rating + "<b> / 5 <p>" + place.vicinity + "</p>";
    
    infoWindowPark.setContent(contentString || "");
    infoWindowPark.open(map, marker);
  });
  
  markers.push(marker);
  
} // createMarker

// https://developers.google.com/maps/documentation/javascript/examples/marker-remove
// Sets the map on all markers in the array.
 function setMapOnAll(map) {
   
   for (let i = 0 ; i < markers.length; i++) {
     markers[i].setMap(map);
   }
   
 }

// Removes the markers from the map, but keeps them in the array.
 function clearMarkers() {
   setMapOnAll(null);
 }

// Shows any markers currently in the array.
 function showMarkers() {
   setMapOnAll(map);
 }

 function deleteMarkers() {
   clearMarkers();
   markers = [];
 }