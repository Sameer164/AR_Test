navigator.geolocation.getCurrentPosition( (position)=> {
    console.log("Latitude is :", position.coords.latitude);
    console.log("Longitude is :", position.coords.longitude);
} );
