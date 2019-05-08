"use strict";

function _templateObject() {
  var data = _taggedTemplateLiteral(["\n              <img style=\"float:left; width:200px; margin-top:30px\" src=\"img/logo_", ".png\">\n              <div style=\"margin-left:220px; margin-bottom:20px;\">\n                <h2>", "</h2><p>", "</p>\n                <p><b>Open:</b> ", "<br/><b>Phone:</b> ", "</p>\n                <p><img src=\"https://maps.googleapis.com/maps/api/streetview?size=350x120&location=", ",", "&key=", "\"></p>\n              </div>\n        "]);

  _templateObject = function _templateObject() {
    return data;
  };

  return data;
}

function _taggedTemplateLiteral(strings, raw) { if (!raw) { raw = strings.slice(0); } return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }

/**
 * Created by Julius Alvarado on 5/4/2019.
 */
// Style credit: https://snazzymaps.com/style/1/pale-dawn
var mapStyle = [{
  "featureType": "administrative",
  "elementType": "all",
  "stylers": [{
    "visibility": "on"
  }, {
    "lightness": 33
  }]
}, {
  "featureType": "landscape",
  "elementType": "all",
  "stylers": [{
    "color": "#f2e5d4"
  }]
}, {
  "featureType": "poi.park",
  "elementType": "geometry",
  "stylers": [{
    "color": "#c5dac6"
  }]
}, {
  "featureType": "poi.park",
  "elementType": "labels",
  "stylers": [{
    "visibility": "on"
  }, {
    "lightness": 20
  }]
}, {
  "featureType": "road",
  "elementType": "all",
  "stylers": [{
    "lightness": 20
  }]
}, {
  "featureType": "road.highway",
  "elementType": "geometry",
  "stylers": [{
    "color": "#c5c6c6"
  }]
}, {
  "featureType": "road.arterial",
  "elementType": "geometry",
  "stylers": [{
    "color": "#e4d7c6"
  }]
}, {
  "featureType": "road.local",
  "elementType": "geometry",
  "stylers": [{
    "color": "#fbfaf7"
  }]
}, {
  "featureType": "water",
  "elementType": "all",
  "stylers": [{
    "visibility": "on"
  }, {
    "color": "#acbcc9"
  }]
}]; // Escapes HTML characters in a template literal string, to prevent XSS.
// See https://www.owasp.org/index.php/XSS_%28Cross_Site_Scripting%29_Prevention_Cheat_Sheet#RULE_.231_-_HTML_Escape_Before_Inserting_Untrusted_Data_into_HTML_Element_Content

function sanitizeHTML(strings) {
  var entities = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  };
  var result = strings[0];

  for (var i = 1; i < arguments.length; i++) {
    result += String(arguments[i]).replace(/[&<>'"]/g, function (_char) {
      return entities[_char];
    });
    result += strings[i];
  }

  return result;
}

function initMap() {
  // Create the map.
  var map = new google.maps.Map(document.getElementsByClassName('map')[0], {
    zoom: 7,
    center: {
      lat: 52.632469,
      lng: -1.689423
    },
    styles: mapStyle
  }); // Load the stores GeoJSON onto the map.

  map.data.loadGeoJson('stores.json'); // Define the custom marker icons, using the store's "category".

  map.data.setStyle(function (feature) {
    return {
      icon: {
        url: "img/icon_".concat(feature.getProperty('category'), ".png"),
        scaledSize: new google.maps.Size(64, 64)
      }
    };
  });
  var apiKey = 'YOUR_API_KEY';
  var infoWindow = new google.maps.InfoWindow();
  infoWindow.setOptions({
    pixelOffset: new google.maps.Size(0, -30)
  }); // Show the information for a store when its marker is clicked.

  map.data.addListener('click', function (event) {
    var category = event.feature.getProperty('category');
    var hours = event.feature.getProperty('hours');
    var description = event.feature.getProperty('description');
    var name = event.feature.getProperty('name');
    var phone = event.feature.getProperty('phone');
    var position = event.feature.getGeometry().get();
    var content = sanitizeHTML(_templateObject(), category, name, description, hours, phone, position.lat(), position.lng(), apiKey);
    infoWindow.setContent(content);
    infoWindow.setPosition(position);
    infoWindow.open(map);
  });
}