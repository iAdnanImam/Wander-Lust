mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v12',
    center: coordinates,
    zoom: 12
});
map.addControl(new mapboxgl.NavigationControl());
new mapboxgl.Marker({color:"red"})
    .setLngLat(coordinates)
    .setPopup(new mapboxgl.Popup().setHTML("<h5>Exact location to be shared after booking.</h5>"))
    .addTo(map);