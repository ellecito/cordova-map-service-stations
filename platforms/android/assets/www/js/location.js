// Get User's Coordinate from their Browser
window.onload = function() {
    // HTML5/W3C Geolocation
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(UserLocation);
    }
}

// Callback function for asynchronous call to HTML5 geolocation
function UserLocation(position) {
    window.localStorage.setItem("coords", JSON.stringify([position.coords.latitude, position.coords.longitude]));
    NearestCity(position.coords.latitude, position.coords.longitude);
}


// Convert Degress to Radians
function Deg2Rad(deg) {
    return deg * Math.PI / 180;
}

function PythagorasEquirectangular(lat1, lon1, lat2, lon2) {
    lat1 = Deg2Rad(lat1);
    lat2 = Deg2Rad(lat2);
    lon1 = Deg2Rad(lon1);
    lon2 = Deg2Rad(lon2);
    var R = 6371; // km
    var x = (lon2 - lon1) * Math.cos((lat1 + lat2) / 2);
    var y = (lat2 - lat1);
    var d = Math.sqrt(x * x + y * y) * R;
    return d;
}

function NearestCity(latitude, longitude) {
    var mindif = 99999;
    var closest;
    var cities_json = JSON.parse(window.localStorage.getItem("comunas"));
    var cities = [];

    $.each(cities_json, function(cities_json, comuna) {
        cities.push([comuna.nombre, comuna.lat, comuna.lng, comuna.codigo]);
    });

    for (index = 0; index < cities.length; ++index) {
        var dif = PythagorasEquirectangular(latitude, longitude, cities[index][1], cities[index][2]);
        if (dif < mindif) {
            closest = index;
            mindif = dif;
        }
    }
    window.localStorage.setItem("comuna", cities[closest]);
    var cne_api = "8Wu9iuqq2l";
    $.ajax({
        type: 'GET',
        url: "http://api.cne.cl/v3/combustibles/vehicular/estaciones?token=" + cne_api + "&comuna=" + cities[closest][3],
        contentType: 'application/x-www-form-urlencoded',
        cache: false,
        dataType: 'json',
        success: function(response) {
            window.localStorage.setItem("estaciones", JSON.stringify(response.data));
        }
    });
}