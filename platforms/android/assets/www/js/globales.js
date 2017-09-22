function getComunas() {
    var resultado;
    $.ajax({
        type: 'POST',
        url: "http://apis.modernizacion.cl/dpa/comunas/",
        contentType: 'application/x-www-form-urlencoded',
        cache: false,
        async: false,
        dataType: 'json',
        success: function(response) {
            resultado = JSON.stringify(response);
        }
    });
    return resultado;
}
window.localStorage.setItem("comunas", getComunas());