var _action = "talleres";

var app = {
    verificar: function(origen){
        var login = localStorage.getItem("login");
        if(login != "true" && origen != "index"){
            window.location.href = "index.html"; 
        }else if(login == "true" && origen == "index"){
            window.location.href = "scanner.html"; 
        }
    },
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    }
};

function resAjax(params, callback){
    $.ajax({
        url: "http://192.168.1.3:8080/app",
        method: "POST",
        data: params,
        dataType: "JSON",
    })
    .done(function (data){
        callback(data);
    })
    .fail(function(err){
        Materialize.toast('Por favor verifique su conexión a internet.', 3000, 'rounded');    
    });
}

function login(){
    var email = $('#txtEmail').val();
    var pass = $('#txtPass').val();
    console.log('Email: ' + email + ", pass: " + pass);
    resAjax({ruta: 'login', correo: email, documento: pass}, function(res){
        if(res.estado == 'correct'){
            localStorage.setItem("login", "true"); 
            window.location.href = "scanner.html"; 
        }else if(res.estdo == "error"){
            $('.errText').css("display" ,"block");
        }else{
            Materialize.toast('Ha ocurrido un error, por favor intentelo nuevamente.', 3000, 'rounded');    
        }
    });
}


function scan(){
    cordova.plugins.barcodeScanner.scan(
        function (result) {
            if(!result.cancelled){
                if(result.format == "QR_CODE"){
                    resAjax({ruta: _action, id: result.text}, function(res){
                        if(res.estado == 'correcto'){
                            var add = {
                                Nombres: res.nombres,
                                Apellidos: res.apellidos,
                                Correo: res.correo,
                                Documento: res.documento,
                                Image: "check.png"
                            };
                            if(_action == "talleres"){
                                add.Msg = "Validación exitosa";
                                add.Taller = res.Taller;
                            }else if(_action == "refrigerio"){
                                add.Msg = "Validación exitosa";
                            }else if(_action == "asistencia"){
                                add.Msg = "Registro exitoso";
                            }
                            _datos.push(add);
                            _datos.splice(0,1);
                        }else if(res.estado == "duplicado"){
                            var add = {
                                Nombres: res.nombres,
                                Apellidos: res.apellidos,
                                Correo: res.correo,
                                Documento: res.documento,
                                Image: "error.png"
                            };
                            if(_action == "refrigerio"){
                                add.Msg = "Refrigerio ya entregado.";
                            }else if(_action == "asistencia"){
                                add.Msg = "Asistencia ya validada.";
                            }
                        }else if(res.estado == "noRegistro"){
                            var add = {
                                Msg: "Usuario no encontrado",
                                Image: "error.png",
                            };
                            _datos.push(add);
                            _datos.splice(0,1);
                        }else{
                            Materialize.toast('Ha ocurrido un error, por favor intentelo nuevamente.', 3000, 'rounded');    
                        }
                    });
                }
            }
        },
        function (error) {
            Materialize.toast('Error en la lectura del código', 3000, 'rounded');  
        }
   );
}

function action(ruta){
    _action = ruta;
    $('.button-collapse').sideNav('hide');
    $("#spanTitle").text(ruta.charAt(0).toUpperCase() + ruta.slice(1));
    console.log(_action);
}

function exit(){
    localStorage.clear();
    window.location.href = "index.html"; 
}