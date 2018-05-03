var api = require('./neo4jApi');
var datepicker = require("js-datepicker");

var mymap;
var circle;
var currentMarkers = [];

$(function () {
    // Map stuff
    mymap = L.map('mapid').setView([54.5, 0], 6);

    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
        maxZoom: 18,
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
        '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
        'Imagery © <a href="http://mapbox.com">Mapbox</a>',
        id: 'mapbox.streets'
    }).addTo(mymap);


    circle = L.circle([54.5, -3.5], {
        color: 'red',
        fillColor: '#f03',
        fillOpacity: 0.5,
        radius: 600000
    }).addTo(mymap);

    mymap.on('click', moveCircle);

    $("#myRange").on('input' , function() {
        circle.setRadius(this.value);
    });


    const picker = datepicker('#datepicker', {startDate: new Date("2012-01-01"), onSelect: accidentsOnDayAndLocation});
});

function showAccident(accident) {
    $("#number").text(accident.number);
    $("#location").text(accident.p);
    $("#datetime").text(accident.dt);
}

function moveCircle(e) {
    var lat = (e.latlng.lat);
    var lng = (e.latlng.lng);
    var newLatLng = new L.LatLng(lat, lng);
    circle.setLatLng(newLatLng);
}

function accidentsOnDayAndLocation(date) {
    // Remove previous
    currentMarkers.forEach(marker => mymap.removeLayer(marker));
    currentMarkers = [];

    // Add new
    var selDate = date.dateSelected;
    var latlng = circle.getLatLng();
    api
        .searchAccidentsOnDayAndLocation(selDate.getFullYear(), selDate.getMonth(), selDate.getDate(), latlng.lat, latlng.lng, circle.getRadius())
        .then(accidents => {
            if (accidents) {
                accidents.forEach(accident => {
                    var marker = L.marker([accident.p.y, accident.p.x]).addTo(mymap);
                    marker.on("click", marker => showAccident(accident));
                    currentMarkers.push(marker)
                });
            }
        });
}

