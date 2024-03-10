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


function displayAds(ads) {
    // const ads_html_container = document.getElementById('ads-container');
    // ads_html_container.innerHTML = '';
    const scene = document.querySelector('a-scene');
    ads.forEach(ad => {
        const latitude = ad.location.lat;
        const longitude = ad.location.lng;
        const placeText = document.createElement('a-link');
        placeText.setAttribute('gps-entity-place', `latitude: ${latitude}; longitude: ${longitude};`);
        placeText.setAttribute('title', place.name);
        placeText.setAttribute('scale', '3 3 3');
        // const singleAdElement = document.createElement('div');
        // singleAdElement.innerHTML = `<h3>${ad.name}</h3><p>${ad.details}</p>`;
        // ads_html_container.appendChild(singleAdElement);
        scene.appendChild(placeText);
    })
}

async function fetchAdsFromServer(latitude, longitude) {
    try{
        const params = {
            radius: 300,   
            clientId: 'KDBHF2BWQCAH1H45CRSEB1VSIQF0II33AWIZAF13ZSVDILXH',
            clientSecret: 'NK4BO1K4RCZIFCMUE35EDF5KQKTS4HEPI3B05MTNIL2CHAME',
            version: '20300101', 
        };
        const corsProxy = 'https://cors-anywhere.herokuapp.com/';

        const endpoint = `${corsProxy}https://api.foursquare.com/v2/venues/search?intent=checkin
        &ll=${latitude},${longitude}
        &radius=${params.radius}
        &client_id=${params.clientId}
        &client_secret=${params.clientSecret}
        &limit=30 
        &v=${params.version}`;
        
        const ads = await fetch(endpoint);
        const ads_json = await ads.json();
        displayAds(ads_json.response().venues());
    } catch (err) {
        console.error("Ads not Available for Error Fetching Ads", err);
    }
}

async function success(pos) {
    const crd = pos.coords;

    if (previousPos) {
        let distanceTravelled = calculateDistance(previousPos.latitude, previousPos.longitude, crd.latitude, crd.longitude);
        if (distanceTravelled >= 50) {
            await fetchAdsFromServer(crd.latitude, crd.longitude);
            previousPos = {latitude: crd.latitude, longitude: crd.longitude};
        }
    } else {
        previousPos = {latitude: crd.latitude, longitude: crd.longitude};
        await fetchAdsFromServer(crd.latitude, crd.longitude);
    }
    
}

function error(err) {
    console.error("Error getting Location", err);
}


function getUserPositions() {
    if (navigator.geolocation) {
        navigator.geolocation.watchPosition(success, error, {enableHighAccuracy: true, maximumAge: 0, timeout: 27000});
    } else {
        console.error("Geolocation is not supported by this browser", err);
    }
}

getUserPositions();