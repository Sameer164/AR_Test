const R = 6371e3;
let previousPos = null;
let timerId = null;

const places = ["McKinley Technology High School", "McDonald's", "Chipotle Mexican Grill", "Salt and Pepper Grill"]

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
        const latitude = ad.geocodes.main.latitude;
        const longitude = ad.geocodes.main.longitude;
        if (places.includes(ad.name)) {
            console.log("Printing an Image");
            const aImage = document.createElement('a-image');
            aImage.setAttribute('src', `assets/${ad.name}.png`);
            aImage.setAttribute('look-at', '[gps-camera]');
            aImage.setAttribute('scale', '10 10 10');
            aImage.setAttribute('gps-entity-place', `latitude: ${latitude}; longitude: ${longitude};`);
            scene.appendChild(aImage);

        } else {
            const placeText = document.createElement('a-link');
            placeText.setAttribute('gps-entity-place', `latitude: ${latitude}; longitude: ${longitude};`);
            placeText.setAttribute('title', ad.name);
            placeText.setAttribute('scale', '1.5 1.5 1.5');
            // const singleAdElement = document.createElement('div');
            // singleAdElement.innerHTML = `<h3>${ad.name}</h3><p>${ad.details}</p>`;
            // ads_html_container.appendChild(singleAdElement);
            scene.appendChild(placeText);
        }
    })
}

async function fetchAdsFromServer(latitude, longitude) {
    try{
        const params = {
            query: 'school',
            radius: 500,   
            ll: `${latitude},${longitude}`
        };

        const searchParams = new URLSearchParams(params);
        const ads = await fetch(
            `https://api.foursquare.com/v3/places/search?${searchParams}`,
            {
              method: 'GET',
              headers: {
                Accept: 'application/json',
                Authorization: 'fsq3SGuVS9Wyr9BMer8PHEu54D94HN4nOHDIvFX19Ty9r30=',
              }
            }
          );
        const ads_json = await ads.json();
        console.log(ads_json.results);
        displayAds(ads_json.results);
    } catch (err) {
        console.error("Ads not Available for Error Fetching Ads", err);
    }
}

async function success(pos, fromTimer = false) {
    const crd = pos.coords;

    if (previousPos) {
        let distanceTravelled = calculateDistance(previousPos.latitude, previousPos.longitude, crd.latitude, crd.longitude);
        if (distanceTravelled >= 50 || fromTimer) {
            await fetchAdsFromServer(crd.latitude, crd.longitude);
            previousPos = {latitude: crd.latitude, longitude: crd.longitude};
            resetTimer();
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

function resetTimer() {
    clearInterval(timerId);
    timerId = setInterval(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(pos => success(pos, true), error);
        }
    }, 500000); 
}

getUserPositions();
resetTimer();