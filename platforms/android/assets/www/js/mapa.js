var coords = JSON.parse(window.localStorage.getItem("coords"));
console.log(coords);
var estaciones = JSON.parse(window.localStorage.getItem("estaciones"));

function initializeMap() {
    var mapOptions = {
        center: new google.maps.LatLng(coords[0], coords[1]),
        zoom: 15,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    var infowindow = new google.maps.InfoWindow();
    var map = new google.maps.Map(document.getElementById("map"), mapOptions);
    new google.maps.Marker({
        position: new google.maps.LatLng(coords[0], coords[1]),
        map: map,
        title: "Aqui estoy",
        animation: google.maps.Animation.DROP
    });
    directionsService = new google.maps.DirectionsService;
    directionsDisplay = new google.maps.DirectionsRenderer({
        map: map
    });
    directionsDisplay.setPanel(document.getElementById('right-panel'));


    function placeMarker(estacion) {
        var marker = new google.maps.Marker({
            position: new google.maps.LatLng(estacion.ubicacion.latitud, estacion.ubicacion.longitud),
            map: map,
            icon: "https://cdn2.iconfinder.com/data/icons/circle-icons-1/64/gas-32.png",
            title: estacion.razon_social,
            animation: google.maps.Animation.DROP,
        });
        google.maps.event.addListener(marker, 'click', function() {
            var pointB = new google.maps.LatLng(estacion.ubicacion.latitud, estacion.ubicacion.longitud);
            calculateAndDisplayRoute(directionsService, directionsDisplay, pointB);
            infowindow.close();
            info = "<div id=`infowindow`>" + estacion.razon_social +
                "<br>" + estacion.direccion_calle + ", " + estacion.direccion_numero + ", " + estacion.nombre_comuna +
                "<br>Horario Atención: " + estacion.horario_atencion +
                "<br>Distribuidor: " + estacion.distribuidor.nombre +
                "<br>Precios:<br>";
            if (estacion.precios["glp vehicular"]) info += "Gas Licuado Vehicular: $" + estacion.precios["glp vehicular"] + "<br>";
            if (estacion.precios["gasolina 93"]) info += "Gasolina 93: $" + estacion.precios["gasolina 93"] + "<br>";
            if (estacion.precios["gasolina 95"]) info += "Gasolina 95: $" + estacion.precios["gasolina 95"] + "<br>";
            if (estacion.precios["gasolina 97"]) info += "Gasolina 97: $" + estacion.precios["gasolina 97"] + "<br>";
            if (estacion.precios["petroleo diesel"]) info += "Petroleo Diesel: $" + estacion.precios["petroleo diesel"] + "<br>";
            if (estacion.precios.gnc) info += "Gas Natural Comprimido: $" + estacion.precios.gnc + "<br>";
            if (estacion.precios.kerosene) info += "Kerosene: $" + estacion.precios.kerosene + "<br>";
            info += "Métodos de pago:<br>";
            if (estacion.metodos_de_pago.efectivo) info += "Efectivo<br>";
            if (estacion.metodos_de_pago.cheque) info += "Cheque<br>";
            if (estacion.metodos_de_pago["tarjetas bancarias"]) info += "Tarjetas Bancarias<br>";
            if (estacion.metodos_de_pago["tarjetas grandes tiendas"]) info += "Tarjetas Grandes Tiendas<br>";
            if (estacion.servicios.tienda || estacion.servicios.farmacia || estacion.servicios.mantencion || estacion.servicios.autoservicio) info += "Servicios:<br>";
            if (estacion.servicios.tienda) info += "Tienda<br>";
            if (estacion.servicios.farmacia) info += "Farmacia<br>";
            if (estacion.servicios.mantencion) info += "Mantención<br>";
            if (estacion.servicios.autoservicio) info += "Autoservicio<br>";
            info += "</div>";
            infowindow.setContent(info);
            infowindow.open(map, marker);
        });
    }

    function calculateAndDisplayRoute(directionsService, directionsDisplay, pointB) {
        directionsService.route({
            origin: new google.maps.LatLng(coords[0], coords[1]),
            destination: pointB,
            travelMode: google.maps.TravelMode.DRIVING
        }, function(response, status) {
            if (status == google.maps.DirectionsStatus.OK) {
                directionsDisplay.setDirections(response);
            } else {
                window.alert('Directions request failed due to ' + status);
            }
        });
    }

    for (var index = 0; index < estaciones.length; index++) {
        placeMarker(estaciones[index]);
    }
}

document.addEventListener('deviceready', initializeMap, false);