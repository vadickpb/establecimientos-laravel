// import
import { OpenStreetMapProvider } from 'leaflet-geosearch';

// setup
const provider = new OpenStreetMapProvider();

document.addEventListener('DOMContentLoaded', () => {

    if(document.querySelector('#mapa')){

        const lat = -13.516802;
        const lng = -71.9809997;

        const mapa = L.map('mapa').setView([lat, lng], 16);

        //eliminar pines previos
        let markers = new L.featureGroup().addTo(mapa);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(mapa);

        let marker;
        // agregar el pin
        marker = new L.marker([lat, lng], {
            draggable : true,
            autoPan : true
        }).addTo(mapa);

        //agregar el pin a las capas
        markers.addLayer(marker);

        //Geocode Service
        const geocodeService = L.esri.Geocoding.geocodeService();

        //buscador de direcciones
        const buscador = document.querySelector('#formbuscador');
        buscador.addEventListener('blur', buscarDireccion);

        reubicarPin(marker);

        function reubicarPin(marker){
            //Detectar movimiento del marker
        marker.on('moveend', function(e){
            marker = e.target;

            const posicion = marker.getLatLng();

            //centrar automaticamente
            mapa.panTo(new L.latLng(posicion.lat, posicion.lng))

            //Reverse Geocoding, cuando el usuario rehubica el pin
            geocodeService.reverse().latlng(posicion, 16).run(function(error, resultado){
                //console.log(error);

                //console.log(resultado.address);

                marker.bindPopup(resultado.address.LongLabel);
                marker.openPopup();

                //lenar los campos
                llenarInputs(resultado);

            })

        });
        }

        function buscarDireccion(e){

            if(e.target.value.length > 1){
                provider.search({query: e.target.value + ' Cusco PE '})
                    .then((resultado) => {
                        if( resultado[0]){

                            //limpiar los pines previos
                            markers.clearLayers();

                            //Reverse Geocoding, cuando el usuario rehubica el pin
                            geocodeService.reverse().latlng(resultado[0].bounds[0], 16).run(function(error, resultado){

                                //Llenar ios inputs
                                llenarInputs(resultado);

                                //centrar el mapa
                                mapa.setView(resultado.latlng)

                                //agregar el pin

                                // agregar el pin
                                marker = new L.marker(resultado.latlng, {
                                    draggable : true,
                                    autoPan : true
                                }).addTo(mapa);




                                //asignar el contenedor de markers el nuevo pin
                                markers.addLayer(marker);


                                //movel el pin
                                reubicarPin(marker);



                            })

                        }
                    })
                    .catch(error =>{
                        //console.log(error);
                    })
            }

        }

        function llenarInputs(resultado){
            document.querySelector('#direccion').value = resultado.address.Address;
            document.querySelector('#distrito').value = resultado.address.City;
            document.querySelector('#lat').value = resultado.latlng.lat;
            document.querySelector('#lng').value = resultado.latlng.lng;

            //console.log(resultado.address);
        }


    }
})
