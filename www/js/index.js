/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {
    // Application Constructor
    initialize: function() {
        this.getPosition();
        this.getComunas();
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        //document.addEventListener('deviceready', this.onDeviceReady, false);
        document.addEventListener("offline", this.onOffline, false);
        document.addEventListener("online", this.onOnline, false);
    },
    onOffline: function() {
        shortToast("Sin conexión.");
    },
    onOnline: function() {
        app.initialize();
    },
    getComunas: function() {
        $.ajax({
            type: 'POST',
            url: "http://apis.modernizacion.cl/dpa/comunas/",
            contentType: 'application/x-www-form-urlencoded',
            cache: false,
            dataType: 'json',
            success: function(response) {
                window.localStorage.setItem("comunas", JSON.stringify(response));
                console.log("Comunas obtenidas.");
                app.NearestCity();
            }
        });
    },
    getPosition: function() {
        navigator.geolocation.getCurrentPosition(app.UserLocation);
    },
    UserLocation: function(position) {
        window.localStorage.setItem("coords", JSON.stringify([position.coords.latitude, position.coords.longitude]));
        console.log("Posición obtenida.");
    },
    NearestCity: function() {
        var mindif = 99999;
        var closest;
        var cities = JSON.parse(window.localStorage.getItem("comunas"));
        var coords = JSON.parse(window.localStorage.getItem("coords"));

        for (index = 0; index < cities.length; ++index) {
            var dif = app.PythagorasEquirectangular(coords[0], coords[1], cities[index].lat, cities[index].lng);
            if (dif < mindif) {
                closest = index;
                mindif = dif;
            }
        }
        window.localStorage.setItem("comuna", JSON.stringify(cities[closest]));
        console.log("Comuna obtenida");
        app.getEstaciones();
    },
    getEstaciones: function() {
        var cne_api = "8Wu9iuqq2l";
        var comuna = JSON.parse(window.localStorage.getItem("comuna"));
        $.ajax({
            type: 'GET',
            url: "http://api.cne.cl/v3/combustibles/vehicular/estaciones?token=" + cne_api + "&comuna=" + comuna.codigo,
            contentType: 'application/x-www-form-urlencoded',
            cache: false,
            dataType: 'json',
            success: function(response) {
                window.localStorage.setItem("estaciones", JSON.stringify(response.data));
                console.log("Estaciones obtenidas.");
                app.initializeMap();
            }
        });
    },
    PythagorasEquirectangular: function(lat1, lon1, lat2, lon2) {
        lat1 = app.Deg2Rad(lat1);
        lat2 = app.Deg2Rad(lat2);
        lon1 = app.Deg2Rad(lon1);
        lon2 = app.Deg2Rad(lon2);
        var R = 6371; // km
        var x = (lon2 - lon1) * Math.cos((lat1 + lat2) / 2);
        var y = (lat2 - lat1);
        var d = Math.sqrt(x * x + y * y) * R;
        return d;
    },
    Deg2Rad: function(deg) {
        return deg * Math.PI / 180;
    },
    initializeMap: function() {
        var coords = JSON.parse(window.localStorage.getItem("coords"));
        var estaciones = JSON.parse(window.localStorage.getItem("estaciones"));
        console.log("Inicializando mapa");
        var mapOptions = {
            center: new google.maps.LatLng(coords[0], coords[1]),
            zoom: 15,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        var infowindow = new google.maps.InfoWindow();
        var map = new google.maps.Map(document.getElementById("map"), mapOptions);
        var my_mark = new google.maps.Marker({
            position: new google.maps.LatLng(coords[0], coords[1]),
            map: map,
            title: "Aqui estoy",
            animation: google.maps.Animation.DROP
        });
        directionsService = new google.maps.DirectionsService;
        directionsDisplay = new google.maps.DirectionsRenderer({
            map: map,
            preserveViewport: true
        });
        directionsDisplay.setPanel(document.getElementById('right-panel'));


        function placeMarker(estacion) {
            var icons = [];
            icons["Copec"] = "img/copec.svg";
            icons["Lipigas"] = "img/lipigas.svg";
            icons["Petrobras"] = "img/petrobras.svg";
            icons["Shell"] = "img/shell.svg";
            icons["Terpel"] = "img/terpel.svg";
            icons["Abastible"] = "img/abastible.svg";
            var icon;
            if (icons[estacion.distribuidor.nombre]) icon = icons[estacion.distribuidor.nombre];
            else icon = "https://cdn2.iconfinder.com/data/icons/circle-icons-1/64/gas-32.png";
            var marker = new google.maps.Marker({
                position: new google.maps.LatLng(estacion.ubicacion.latitud, estacion.ubicacion.longitud),
                map: map,
                icon: icon,
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

        function onSuccess(position) {
            map.setCenter(new google.maps.LatLng(position.coords.latitude, position.coords.longitude));
            var my_mark = new google.maps.Marker({
                position: new google.maps.LatLng(position.coords.latitude, position.coords.longitude),
                map: map,
                title: "Aqui estoy",
                animation: google.maps.Animation.DROP
            });
        }

        navigator.geolocation.watchPosition(onSuccess);
    }
};

app.initialize();

setInterval(checkLocationAvailable, 10000);

function checkLocationAvailable() {
    cordova.plugins.diagnostic.isLocationAvailable(onSuccessDiagnostic, onErrorDiagnostic);
}

function onSuccessDiagnostic(available) {
    if (!available) cordova.plugins.diagnostic.switchToLocationSettings();
}

function onErrorDiagnostic(error) {
    console.log("onErrorDiagnostic");
    shortToast("Error con GPS: " + error);
    cordova.plugins.diagnostic.switchToLocationSettings();
}