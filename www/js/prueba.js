$.ajax({
    type: 'POST',
    url: "http://apis.modernizacion.cl/dpa/regiones/",
    contentType: 'application/x-www-form-urlencoded',
    cache: false,
    dataType: 'json',
    success: function(response) {
        $.each(response,
            function(response, region) {
                $("#mapa").append("<p>" + region.codigo + " " + region.nombre + "</p>");
                $("#mapa").append("<p>" + "Latitud: " + region.lat + "</p>");
                $("#mapa").append("<p>" + "Longitud: " + region.lng + "</p>");
            });
        console.log(response.nombre);
        var onSuccess = function(position) {
            alert('Latitude: ' + position.coords.latitude + '\n' +
                'Longitude: ' + position.coords.longitude + '\n' +
                'Altitude: ' + position.coords.altitude + '\n' +
                'Accuracy: ' + position.coords.accuracy + '\n' +
                'Altitude Accuracy: ' + position.coords.altitudeAccuracy + '\n' +
                'Heading: ' + position.coords.heading + '\n' +
                'Speed: ' + position.coords.speed + '\n' +
                'Timestamp: ' + position.timestamp + '\n');
        };
        console.log(navigator.geolocation.getCurrentPosition(onSuccess));
    },
    error: function(response) {
        console.log(response);
    }
});