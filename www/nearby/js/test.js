var brooklyn = new google.maps.LatLng(styleMapMarker.currentLocation.lat, styleMapMarker.currentLocation.lng);

var MY_MAPTYPE_ID = 'custom_style';


var featureOpts = [
    {
        stylers: [
            { hue: '#890000' },
            { visibility: 'simplified' },
            { gamma: 0.5 },
            { weight: 0.5 }
        ]
    },
    {
        elementType: 'labels',
        stylers: [
            { visibility: 'off' }
        ]
    },
    {
        featureType: 'water',
        stylers: [
            { color: '#890000' }
        ]
    }
];

var mapOptions = {
    zoom: 12,
    center: brooklyn,
    mapTypeControlOptions: {
        mapTypeIds: [google.maps.MapTypeId.ROADMAP, MY_MAPTYPE_ID]
    },
    mapTypeId: MY_MAPTYPE_ID
};

map = new google.maps.Map(document.getElementById('map-canvas'),
    mapOptions);

var styledMapOptions = {
    name: 'Custom Style'
};

var customMapType = new google.maps.StyledMapType(featureOpts, styledMapOptions);

map.mapTypes.set(MY_MAPTYPE_ID, customMapType);