const R = 6371e3;
let previousPos = null;

function calculateDistance(o_lat, o_lng, d_lat, d_lng) {
    let o_alat = o_lat * Math.PI;
    let d_alat = d_lat * Math.PI;

    let del_lat = (d_lat - o_lat) * Math.PI;
    let del_lng = (d_lng - o_lng) * Math.PI;

    let haver_ang = (Math.sin(del_lat / 2) * Math.sin(del_lat / 2)) + (Math.cos(o_alat) * Math.cos(d_alat) * (Math.sin(del_lng / 2) * Math.sin(del_lng / 2)));
    return 2 * R * Math.atan2(Math.sqrt(haver_ang), Math.sqrt(1 - haver_ang));
}


function success(pos) {
    const crd = pos.coords;

    if (previousPos) {
        let distanceTravelled = calculateDistance(previousPos.latitude, previousPos.longitude, crd.latitude, crd.longitude);
        if (distanceTravelled >= 50) {
            document.getElementById('distance-info').textContent = `User Moved approximately ${distanceTravelled.toFixed(2)} meters.`;
        }
        previousPos = {latitude: crd.latitude, longitude: crd.longitude};

    }
}

function error(err) {
    document.getElementById('distance-info').textContent = "Error getting Location";
}

function getUserPositions() {
    if (navigator.geolocation) {
        navigator.geolocation.watchPosition(success, error, {enableHighAccuracy: true, maximumAge: 0, timeout: 27000});
    } else {
        document.getElementById('distance-info').textContent = "Geolocation is not supported by this browser";
    }
}

